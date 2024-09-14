import axios from 'axios';
import { dataSource } from "./database";
import { executeWithRetries } from "./utils";
import { ALLOWED_IND_DEPARTMENTS, ALLOWED_DUB_DEPARTMENTS,ASSETS } from "./constants";

const ALLOWED_DEPARTMENTS = [...ALLOWED_IND_DEPARTMENTS, ...ALLOWED_DUB_DEPARTMENTS];

async function fetchBatch(offset:number, batchSize:number) {
    const query = `
        SELECT *
        FROM product
        WHERE certificate_number IS NOT NULL 
        AND (
            assets_pre_check->>'B2B_SPARKLE_CHECK' = 'false' 
            OR assets_pre_check->>'B2B_CHECK' = 'false' 
            OR assets_pre_check->>'CERT_FILE' = 'false'
            OR assets_pre_check->>'CERT_IMG' = 'false'
            OR assets_pre_check->>'IMG' = 'false'
            OR assets_pre_check->>'HEART' = 'false'
            OR assets_pre_check->>'ARROW' = 'false'
            OR assets_pre_check->>'ASET' = 'false'
            OR assets_pre_check->>'IDEAL' = 'false'
            OR assets_pre_check->>'FLUORESCENCE' = 'false'
        )
        AND (NOW() - assets_pre_check_timestamp) > INTERVAL '24 hours'
        AND department_code = ANY($1)
        ORDER BY assets_pre_check_timestamp ASC
        LIMIT ${batchSize} OFFSET ${offset}
    `;

    return await executeWithRetries(() => dataSource.query(query, [ALLOWED_DEPARTMENTS]), 3, 1000);
}

async function checkUrl(url:string) {
    let response = {};
    try {
        response = await executeWithRetries(() => axios.get(url, {
            timeout: 120000 
        }), 1, 1000);
    } catch (error:any) {
        response = {
            status: error.response ? error.response.status : 500,
            error: error.message
        };
    }
    return response;
}

async function updateProduct(id:string, updates:any) {
    // Correctly nest jsonb_set calls
    let finalJsonUpdate = updates.reduce((acc:any, update:any) => {
        return `jsonb_set(${acc}, ${update.path}, ${update.value})`;
    }, 'assets_pre_check');

    const finalQuery = `
        UPDATE product
        SET assets_pre_check = ${finalJsonUpdate},
            assets_pre_check_timestamp = NOW()
        WHERE id = '${id}'
    `;
    return await executeWithRetries(() => dataSource.query(finalQuery), 3, 1000);
}

async function updateProductTimestamp(id:string) {
    const finalQuery = `
        UPDATE product
        SET 
            assets_pre_check_timestamp = NOW()
        WHERE id = '${id}'
    `;
    return await executeWithRetries(() => dataSource.query(finalQuery), 3, 1000);
}

export async function assetsPreCheck() {
    const apcSwitch = '1'; // Replace with actual config retrieval
    // const apcSwitch = await getConfigValueByKey('assets-pre-check-switch');
    
    if (apcSwitch && apcSwitch.trim() === '1') {
        console.log("Starting Assets Pre Check every 4 hours");

        const batchSize = 1000;
        let offset = 0;
        let moreRows = true;
        let updateCount = 0;

        while (moreRows) {
            console.log(`Fetching batch with offset ${offset}`);

            try {
                const result: any = await fetchBatch(offset, batchSize);

                if (result.rows.length > 0) {
                    console.log(`Processing ${result.rows.length} products`);

                    for (const product of result.rows) {
                        const { lot_id, id, certificate_url, certificate_number } = product;
                        const updates: any = [];
                        let updated = false;

                        const checks = ['CERT_FILE', 'CERT_IMG', 'B2B_SPARKLE_CHECK', 'B2B_CHECK', 'IMG', 'HEART', 'ARROW', 'ASET', 'IDEAL', 'FLUORESCENCE'];
                        
                        for (const check of checks) {
                            if (product.assets_pre_check?.[check] === false) {
                                console.log(`Checking ${check} for product ${lot_id}`);
                                let url: string;

                                if (['CERT_FILE', 'CERT_IMG'].includes(check)) {
                                    url = ASSETS[check].replace("***", certificate_number);
                                } else {
                                    url = ASSETS[check].replace("***", lot_id);
                                }

                                try {
                                    const response: any = await checkUrl(url);
                                    if (response.status === 200) {
                                        console.log(`${check} passed for product ${lot_id}`);
                                        updates.push({ path: `'{${check}}'`, value: "'true'::jsonb" });
                                        updated = true;
                                    }
                                } catch (error) {
                                    console.error(`Error checking URL for ${check} of product ${lot_id}:`, error);
                                }
                            }
                        }

                        if (updated) {
                            console.log(`Updating product ${lot_id}`);
                            try {
                                await updateProduct(id, updates);
                                updateCount++;
                                console.log(`Product ${lot_id} updated successfully`);
                            } catch (error) {
                                console.error(`Error updating product ${lot_id}:`, error);
                            }
                        } else {
                            console.log(`Product ${lot_id} assets check failed, marking timestamp`);
                            try {
                                await updateProductTimestamp(id);
                            } catch (error) {
                                console.error(`Error updating product timestamp for ${lot_id}:`, error);
                            }
                        }
                    }

                    offset += batchSize;
                    moreRows = result.rows.length === batchSize;
                } else {
                    console.log("No more products to process");
                    moreRows = false;
                }
            } catch (error) {
                console.error(`Error fetching batch with offset ${offset}:`, error);
                moreRows = false;
            }
        }

        console.log(`Assets Pre Check completed. Total updated stones: ${updateCount}`);
    } else {
        console.log(`Assets Pre Check is off.`);
    }
}


assetsPreCheck().catch(error => {
    console.error("Error running assets pre check:", error);
    process.exit(1);
});

