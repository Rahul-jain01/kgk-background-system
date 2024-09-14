// allowed departments
export const ALLOWED_IND_DEPARTMENTS =[190, 191, 201, 206, 401,272]
export const ALLOWED_DUB_DEPARTMENTS =[450,445,446,449]

// assets base urls
// pass the certificate number in the ***
export const ASSETS: Record<string, string> ={

    CERT_FILE :'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/Certificates/***.pdf',
    CERT_IMG :'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/Cert/***.jpeg',
   // pass the lot_id in the ***
   B2B_SPARKLE_CHECK:  'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***-S/0.json?version:1',
   B2B_CHECK: 'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/0.json?version:1',
   
    IMG: 'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/still.jpg',
    HEART:'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/Heart_Black_BG.jpg',
    ARROW:'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/Arrow_Black_BG.jpg',
    ASET:'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/ASET_White_BG.jpg',
    IDEAL:'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***/IDEAL_White_BG.jpg',
    FLUORESCENCE:'https://storageweweb.blob.core.windows.net/files/INVENTORYDATA/V360Mini5/imaged/***-F/still.jpg',
}