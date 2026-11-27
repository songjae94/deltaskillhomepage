(() => {
  'use strict';
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  const attr = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const examFontFamily='DS Exam Noto Serif KR';
  const fontDirectory = new URL('assets/fonts/', document.currentScript?.src || document.baseURI);
  // Exact cmap of the independently verified Medium core (3,368 codepoints).
  const mediumCoreRange = 'U+20-7E,U+A0-103,U+110-113,U+11A-11B,U+128-12B,U+143-144,U+147-148,U+14C-14F,U+152-153,U+168-16D,U+192,U+1A0-1A1,U+1AF-1B0,U+1CD-1DC,U+1F8-1F9,U+1100-11FF,U+2002-2003,U+2010-2016,U+2018-201A,U+201C-201E,U+2020-2022,U+2025-2027,U+2030,U+2032-2033,U+2035,U+2039-203C,U+2042,U+2047-2049,U+2051,U+3000-303F,U+3131-318E,U+A960-A97C,U+AC00-AC01,U+AC04,U+AC07-AC0A,U+AC10-AC17,U+AC19-AC1D,U+AC20,U+AC24,U+AC2C-AC2D,U+AC2F-AC31,U+AC38-AC39,U+AC3C,U+AC40,U+AC4B,U+AC4D,U+AC54,U+AC58,U+AC5C,U+AC70-AC71,U+AC74,U+AC77-AC78,U+AC7A,U+AC80-AC81,U+AC83-AC86,U+AC89-AC8C,U+AC90,U+AC94,U+AC9C-AC9D,U+AC9F-ACA1,U+ACA8-ACAA,U+ACAC,U+ACAF-ACB0,U+ACB8-ACB9,U+ACBB-ACBD,U+ACC1,U+ACC4,U+ACC8,U+ACCC,U+ACD5,U+ACD7,U+ACE0-ACE1,U+ACE4,U+ACE7-ACE8,U+ACEA,U+ACEC,U+ACEF-ACF1,U+ACF3,U+ACF5-ACF6,U+ACFC-ACFD,U+AD00,U+AD04,U+AD06,U+AD0C-AD0D,U+AD0F,U+AD11,U+AD18,U+AD1C,U+AD20,U+AD29,U+AD2C-AD2D,U+AD34-AD35,U+AD38,U+AD3C,U+AD44-AD45,U+AD47,U+AD49,U+AD50,U+AD54,U+AD58,U+AD61,U+AD63,U+AD6C-AD6D,U+AD70,U+AD73-AD76,U+AD7B-AD7D,U+AD7F,U+AD81-AD82,U+AD88-AD89,U+AD8C,U+AD90,U+AD9C-AD9D,U+ADA4,U+ADB7,U+ADC0-ADC1,U+ADC4,U+ADC8,U+ADD0-ADD1,U+ADD3,U+ADDC,U+ADE0,U+ADE4,U+ADF8-ADF9,U+ADFC,U+ADFF-AE01,U+AE08-AE09,U+AE0B,U+AE0D,U+AE14,U+AE30-AE31,U+AE34,U+AE37-AE38,U+AE3A,U+AE40-AE41,U+AE43,U+AE45-AE46,U+AE4A,U+AE4C-AE4E,U+AE50,U+AE54,U+AE56,U+AE5C-AE5D,U+AE5F-AE61,U+AE65,U+AE68-AE69,U+AE6C,U+AE70,U+AE78-AE79,U+AE7B-AE7D,U+AE84-AE85,U+AE8C,U+AEBC-AEBE,U+AEC0,U+AEC4,U+AECC-AECD,U+AECF-AED1,U+AED8-AED9,U+AEDC,U+AEE8,U+AEEB,U+AEED,U+AEF4,U+AEF8,U+AEFC,U+AF07-AF08,U+AF0D,U+AF10,U+AF2C-AF2D,U+AF30,U+AF32,U+AF34,U+AF3C-AF3D,U+AF3F,U+AF41-AF43,U+AF48-AF49,U+AF50,U+AF5C-AF5D,U+AF64-AF65,U+AF79,U+AF80,U+AF84,U+AF88,U+AF90-AF91,U+AF95,U+AF9C,U+AFB8-AFB9,U+AFBC,U+AFC0,U+AFC7-AFC9,U+AFCB,U+AFCD-AFCE,U+AFD4,U+AFDC,U+AFE8-AFE9,U+AFF0-AFF1,U+AFF4,U+AFF8,U+B000-B001,U+B004,U+B00C,U+B010,U+B014,U+B01C-B01D,U+B028,U+B044-B045,U+B048,U+B04A,U+B04C,U+B04E,U+B053-B055,U+B057,U+B059,U+B05D,U+B07C-B07D,U+B080,U+B084,U+B08C-B08D,U+B08F,U+B091,U+B098-B09A,U+B09C,U+B09F-B0A2,U+B0A8-B0A9,U+B0AB-B0AF,U+B0B1,U+B0B3-B0B5,U+B0B8,U+B0BC,U+B0C4-B0C5,U+B0C7-B0C9,U+B0D0-B0D1,U+B0D4,U+B0D8,U+B0E0,U+B0E5,U+B108-B109,U+B10B-B10C,U+B110,U+B112-B113,U+B118-B119,U+B11B-B11D,U+B123-B125,U+B128,U+B12C,U+B134-B135,U+B137-B139,U+B140-B141,U+B144,U+B148,U+B150-B151,U+B154-B155,U+B158,U+B15C,U+B160,U+B178-B179,U+B17C,U+B180,U+B182,U+B188-B189,U+B18B,U+B18D,U+B192-B194,U+B198,U+B19C,U+B1A8,U+B1CC,U+B1D0,U+B1D4,U+B1DC-B1DD,U+B1DF,U+B1E8-B1E9,U+B1EC,U+B1F0,U+B1F9,U+B1FB,U+B1FD,U+B204-B205,U+B208,U+B20B-B20C,U+B214-B215,U+B217,U+B219,U+B220,U+B234,U+B23C,U+B258,U+B25C,U+B260,U+B268-B269,U+B274-B275,U+B27C,U+B284-B285,U+B289,U+B290-B291,U+B294,U+B298-B29A,U+B2A0-B2A1,U+B2A3,U+B2A5-B2A6,U+B2AA,U+B2AC,U+B2B0,U+B2B4,U+B2C8-B2C9,U+B2CC,U+B2D0,U+B2D2,U+B2D8-B2D9,U+B2DB,U+B2DD,U+B2E2,U+B2E4-B2E6,U+B2E8,U+B2EB-B2EF,U+B2F3-B2F5,U+B2F7-B2FB,U+B2FF-B301,U+B304,U+B308,U+B310-B311,U+B313-B315,U+B31C,U+B354-B356,U+B358,U+B35B-B35C,U+B35E-B35F,U+B364-B365,U+B367,U+B369,U+B36B,U+B36E,U+B370-B371,U+B374,U+B378,U+B380-B381,U+B383-B385,U+B38C,U+B390,U+B394,U+B3A0-B3A1,U+B3A8,U+B3AC,U+B3C4-B3C5,U+B3C8,U+B3CB-B3CC,U+B3CE,U+B3D0,U+B3D4-B3D5,U+B3D7,U+B3D9,U+B3DB,U+B3DD,U+B3E0,U+B3E4,U+B3E8,U+B3FC,U+B410,U+B418,U+B41C,U+B420,U+B428-B429,U+B42B,U+B434,U+B450-B451,U+B454,U+B458,U+B460-B461,U+B463,U+B465,U+B46C,U+B480,U+B488,U+B49D,U+B4A4,U+B4A8,U+B4AC,U+B4B5,U+B4B7,U+B4B9,U+B4C0,U+B4C4,U+B4C8,U+B4D0,U+B4D5,U+B4DC-B4DD,U+B4E0,U+B4E3-B4E4,U+B4E6,U+B4EC-B4ED,U+B4EF,U+B4F1,U+B4F8,U+B514-B515,U+B518,U+B51B-B51C,U+B524-B525,U+B527-B52A,U+B530-B531,U+B534,U+B538,U+B540-B541,U+B543-B545,U+B54B-B54D,U+B550,U+B554,U+B55C-B55D,U+B55F-B561,U+B5A0-B5A1,U+B5A4,U+B5A8,U+B5AA-B5AB,U+B5B0-B5B1,U+B5B3-B5B5,U+B5BB-B5BD,U+B5C0,U+B5C4,U+B5CC-B5CD,U+B5CF-B5D1,U+B5D8,U+B5EC,U+B610-B611,U+B614,U+B618,U+B625,U+B62C,U+B634,U+B648,U+B664,U+B668,U+B69C-B69D,U+B6A0,U+B6A4,U+B6AB-B6AC,U+B6B1,U+B6D4,U+B6F0,U+B6F4,U+B6F8,U+B700-B701,U+B705,U+B728-B729,U+B72C,U+B72F-B730,U+B738-B739,U+B73B,U+B744,U+B748,U+B74C,U+B754-B755,U+B760,U+B764,U+B768,U+B770-B771,U+B773,U+B775,U+B77C-B77D,U+B780,U+B784,U+B78C-B78D,U+B78F-B792,U+B796-B799,U+B79C,U+B7A0,U+B7A8-B7A9,U+B7AB-B7AD,U+B7B4-B7B5,U+B7B8,U+B7C7,U+B7C9,U+B7EC-B7ED,U+B7F0,U+B7F4,U+B7FC-B7FD,U+B7FF-B801,U+B807-B809,U+B80C,U+B810,U+B818-B819,U+B81B,U+B81D,U+B824-B825,U+B828,U+B82C,U+B834-B835,U+B837-B839,U+B840,U+B844,U+B851,U+B853,U+B85C-B85D,U+B860,U+B864,U+B86C-B86D,U+B86F,U+B871,U+B878,U+B87C,U+B88D,U+B8A8,U+B8B0,U+B8B4,U+B8B8,U+B8C0-B8C1,U+B8C3,U+B8C5,U+B8CC,U+B8D0,U+B8D4,U+B8DD,U+B8DF,U+B8E1,U+B8E8-B8E9,U+B8EC,U+B8F0,U+B8F8-B8F9,U+B8FB,U+B8FD,U+B904,U+B918,U+B920,U+B93C-B93D,U+B940,U+B944,U+B94C,U+B94F,U+B951,U+B958-B959,U+B95C,U+B960,U+B968-B969,U+B96B,U+B96D,U+B974-B975,U+B978,U+B97C,U+B984-B985,U+B987,U+B989-B98A,U+B98D-B98E,U+B9AC-B9AD,U+B9B0,U+B9B4,U+B9BC-B9BD,U+B9BF,U+B9C1,U+B9C8-B9C9,U+B9CC,U+B9CE-B9D2,U+B9D8-B9D9,U+B9DB,U+B9DD-B9DE,U+B9E1,U+B9E3-B9E5,U+B9E8,U+B9EC,U+B9F4-B9F5,U+B9F7-B9FA,U+BA00-BA01,U+BA08,U+BA15,U+BA38-BA39,U+BA3C,U+BA40,U+BA42,U+BA48-BA49,U+BA4B,U+BA4D-BA4E,U+BA53-BA55,U+BA58,U+BA5C,U+BA64-BA65,U+BA67-BA69,U+BA70-BA71,U+BA74,U+BA78,U+BA83-BA85,U+BA87,U+BA8C,U+BAA8-BAA9,U+BAAB-BAAC,U+BAB0,U+BAB2,U+BAB8-BAB9,U+BABB,U+BABD,U+BAC4,U+BAC8,U+BAD8-BAD9,U+BAFC,U+BB00,U+BB04,U+BB0D,U+BB0F,U+BB11,U+BB18,U+BB1C,U+BB20,U+BB29,U+BB2B,U+BB34-BB36,U+BB38,U+BB3B-BB3E,U+BB44-BB45,U+BB47,U+BB49,U+BB4D,U+BB4F-BB50,U+BB54,U+BB58,U+BB61,U+BB63,U+BB6C,U+BB88,U+BB8C,U+BB90,U+BBA4,U+BBA8,U+BBAC,U+BBB4,U+BBB7,U+BBC0,U+BBC4,U+BBC8,U+BBD0,U+BBD3,U+BBF8-BBF9,U+BBFC,U+BBFF-BC00,U+BC02,U+BC08-BC09,U+BC0B-BC0D,U+BC0F,U+BC11,U+BC14-BC18,U+BC1B-BC1F,U+BC24-BC25,U+BC27,U+BC29,U+BC2D,U+BC30-BC31,U+BC34,U+BC38,U+BC40-BC41,U+BC43-BC45,U+BC49,U+BC4C-BC4D,U+BC50,U+BC5D,U+BC84-BC85,U+BC88,U+BC8B-BC8C,U+BC8E,U+BC94-BC95,U+BC97,U+BC99-BC9A,U+BCA0-BCA1,U+BCA4,U+BCA7-BCA8,U+BCB0-BCB1,U+BCB3-BCB5,U+BCBC-BCBD,U+BCC0,U+BCC4,U+BCCD,U+BCCF-BCD1,U+BCD5,U+BCD8,U+BCDC,U+BCF4-BCF6,U+BCF8,U+BCFC,U+BD04-BD05,U+BD07,U+BD09,U+BD10,U+BD14,U+BD24,U+BD2C,U+BD40,U+BD48-BD49,U+BD4C,U+BD50,U+BD58-BD59,U+BD64,U+BD68,U+BD80-BD81,U+BD84,U+BD87-BD8A,U+BD90-BD91,U+BD93,U+BD95,U+BD99-BD9A,U+BD9C,U+BDA4,U+BDB0,U+BDB8,U+BDD4-BDD5,U+BDD8,U+BDDC,U+BDE9,U+BDF0,U+BDF4,U+BDF8,U+BE00,U+BE03,U+BE05,U+BE0C-BE0D,U+BE10,U+BE14,U+BE1C-BE1D,U+BE1F,U+BE44-BE45,U+BE48,U+BE4C,U+BE4E,U+BE54-BE55,U+BE57,U+BE59-BE5B,U+BE60-BE61,U+BE64,U+BE68,U+BE6A,U+BE70-BE71,U+BE73-BE75,U+BE7B-BE7D,U+BE80,U+BE84,U+BE8C-BE8D,U+BE8F-BE91,U+BE98-BE99,U+BEA8,U+BED0-BED1,U+BED4,U+BED7-BED8,U+BEE0,U+BEE3-BEE5,U+BEEC,U+BF01,U+BF08-BF09,U+BF18-BF19,U+BF1B-BF1D,U+BF40-BF41,U+BF44,U+BF48,U+BF50-BF51,U+BF55,U+BF94,U+BFB0,U+BFC5,U+BFCC-BFCD,U+BFD0,U+BFD4,U+BFDC,U+BFDF,U+BFE1,U+C03C,U+C051,U+C058,U+C05C,U+C060,U+C068-C069,U+C090-C091,U+C094,U+C098,U+C0A0-C0A1,U+C0A3,U+C0A5,U+C0AC-C0AD,U+C0AF-C0B0,U+C0B3-C0B6,U+C0BC-C0BD,U+C0BF-C0C1,U+C0C5,U+C0C8-C0C9,U+C0CC,U+C0D0,U+C0D8-C0D9,U+C0DB-C0DD,U+C0E4-C0E5,U+C0E8,U+C0EC,U+C0F4-C0F5,U+C0F7,U+C0F9,U+C100,U+C104,U+C108,U+C110,U+C115,U+C11C-C120,U+C123-C124,U+C126-C127,U+C12C-C12D,U+C12F-C131,U+C136,U+C138-C139,U+C13C,U+C140,U+C148-C149,U+C14B-C14D,U+C154-C155,U+C158,U+C15C,U+C164-C165,U+C167-C169,U+C170,U+C174,U+C178,U+C185,U+C18C-C18E,U+C190,U+C194,U+C196,U+C19C-C19D,U+C19F,U+C1A1,U+C1A5,U+C1A8-C1A9,U+C1AC,U+C1B0,U+C1BD,U+C1C4,U+C1C8,U+C1CC,U+C1D4,U+C1D7-C1D8,U+C1E0,U+C1E4,U+C1E8,U+C1F0-C1F1,U+C1F3,U+C1FC-C1FD,U+C200,U+C204,U+C20C-C20D,U+C20F,U+C211,U+C218-C219,U+C21C,U+C21F-C220,U+C228-C229,U+C22B,U+C22D,U+C22F,U+C231-C232,U+C234,U+C248,U+C250-C251,U+C254,U+C258,U+C260,U+C265,U+C26C-C26D,U+C270,U+C274,U+C27C-C27D,U+C27F,U+C281,U+C288-C289,U+C290,U+C298,U+C29B,U+C29D,U+C2A4-C2A5,U+C2A8,U+C2AC-C2AD,U+C2B4-C2B5,U+C2B7,U+C2B9,U+C2DC-C2DD,U+C2E0,U+C2E3-C2E4,U+C2EB-C2ED,U+C2EF,U+C2F1,U+C2F6,U+C2F8-C2F9,U+C2FB-C2FC,U+C300,U+C308-C309,U+C30C-C30D,U+C313-C315,U+C318,U+C31C,U+C324-C325,U+C328-C329,U+C345,U+C368-C369,U+C36C,U+C370,U+C372,U+C378-C379,U+C37C-C37D,U+C384,U+C388,U+C38C,U+C3C0,U+C3D8-C3D9,U+C3DC,U+C3DF-C3E0,U+C3E2,U+C3E8-C3E9,U+C3ED,U+C3F4-C3F5,U+C3F8,U+C408,U+C410,U+C424,U+C42C,U+C430,U+C434,U+C43C-C43D,U+C448,U+C464-C465,U+C468,U+C46C,U+C474-C475,U+C479,U+C480,U+C494,U+C49C,U+C4B8,U+C4BC,U+C4E9,U+C4F0-C4F1,U+C4F4,U+C4F8,U+C4FA,U+C4FF-C501,U+C50C,U+C510,U+C514,U+C51C,U+C528-C529,U+C52C,U+C530,U+C538-C539,U+C53B,U+C53D,U+C544-C545,U+C548-C54A,U+C54C-C54E,U+C553-C555,U+C557-C559,U+C55D-C55E,U+C560-C561,U+C564,U+C568,U+C570-C571,U+C573-C575,U+C57C-C57D,U+C580,U+C584,U+C587,U+C58C-C58D,U+C58F,U+C591,U+C595,U+C597-C598,U+C59C,U+C5A0,U+C5A9,U+C5B4-C5B5,U+C5B8-C5B9,U+C5BB-C5BE,U+C5C4-C5CA,U+C5CC,U+C5CE,U+C5D0-C5D1,U+C5D4,U+C5D8,U+C5E0-C5E1,U+C5E3,U+C5E5,U+C5EC-C5EE,U+C5F0,U+C5F4,U+C5F6-C5F7,U+C5FC-C601,U+C605-C608,U+C60C,U+C610,U+C618-C619,U+C61B-C61C,U+C624-C625,U+C628,U+C62C-C62E,U+C630,U+C633-C635,U+C637,U+C639,U+C63B,U+C640-C641,U+C644,U+C648,U+C650-C651,U+C653-C655,U+C65C-C65D,U+C660,U+C66C,U+C66F,U+C671,U+C678-C679,U+C67C,U+C680,U+C688-C689,U+C68B,U+C68D,U+C694-C695,U+C698,U+C69C,U+C6A4-C6A5,U+C6A7,U+C6A9,U+C6B0-C6B1,U+C6B4,U+C6B8-C6BA,U+C6C0-C6C1,U+C6C3,U+C6C5,U+C6CC-C6CD,U+C6D0,U+C6D4,U+C6DC-C6DD,U+C6E0-C6E1,U+C6E8-C6E9,U+C6EC,U+C6F0,U+C6F8-C6F9,U+C6FD,U+C704-C705,U+C708,U+C70C,U+C714-C715,U+C717,U+C719,U+C720-C721,U+C724,U+C728,U+C730-C731,U+C733,U+C735,U+C737,U+C73C-C73D,U+C740,U+C744,U+C74A,U+C74C-C74D,U+C74F,U+C751-C758,U+C75C,U+C760,U+C768,U+C76B,U+C774-C775,U+C778,U+C77C-C77E,U+C783-C785,U+C787-C78A,U+C78E,U+C790-C791,U+C794,U+C796-C798,U+C79A,U+C7A0-C7A1,U+C7A3-C7A6,U+C7AC-C7AD,U+C7B0,U+C7B4,U+C7BC-C7BD,U+C7BF-C7C1,U+C7C8-C7C9,U+C7CC,U+C7CE,U+C7D0,U+C7D8,U+C7DD,U+C7E4,U+C7E8,U+C7EC,U+C800-C801,U+C804,U+C808,U+C80A,U+C810-C811,U+C813,U+C815-C816,U+C81C-C81D,U+C820,U+C824,U+C82C-C82D,U+C82F,U+C831,U+C838,U+C83C,U+C840,U+C848-C849,U+C84C-C84D,U+C854,U+C870-C871,U+C874,U+C878,U+C87A,U+C880-C881,U+C883,U+C885-C887,U+C88B-C88D,U+C894,U+C89D,U+C89F,U+C8A1,U+C8A8,U+C8BC-C8BD,U+C8C4,U+C8C8,U+C8CC,U+C8D4-C8D5,U+C8D7,U+C8D9,U+C8E0-C8E1,U+C8E4,U+C8F5,U+C8FC-C8FD,U+C900,U+C904-C906,U+C90C-C90D,U+C90F,U+C911,U+C918,U+C92C,U+C934,U+C950-C951,U+C954,U+C958,U+C960-C961,U+C963,U+C96C,U+C970,U+C974,U+C97C,U+C988-C989,U+C98C,U+C990,U+C998-C999,U+C99B,U+C99D,U+C9C0-C9C1,U+C9C4,U+C9C7-C9C8,U+C9CA,U+C9D0-C9D1,U+C9D3,U+C9D5-C9D6,U+C9D9-C9DA,U+C9DC-C9DD,U+C9E0,U+C9E2,U+C9E4,U+C9E7,U+C9EC-C9ED,U+C9EF-C9F1,U+C9F8-C9F9,U+C9FC,U+CA00,U+CA08-CA09,U+CA0B-CA0D,U+CA14,U+CA18,U+CA29,U+CA4C-CA4D,U+CA50,U+CA54,U+CA5C-CA5D,U+CA5F-CA61,U+CA68,U+CA7D,U+CA84,U+CA98,U+CABC-CABD,U+CAC0,U+CAC4,U+CACC-CACD,U+CACF,U+CAD1,U+CAD3,U+CAD8-CAD9,U+CAE0,U+CAEC,U+CAF4,U+CB08,U+CB10,U+CB14,U+CB18,U+CB20-CB21,U+CB41,U+CB48-CB49,U+CB4C,U+CB50,U+CB58-CB59,U+CB5D,U+CB64,U+CB78-CB79,U+CB9C,U+CBB8,U+CBD4,U+CBE4,U+CBE7,U+CBE9,U+CC0C-CC0D,U+CC10,U+CC14,U+CC1C-CC1D,U+CC21-CC22,U+CC27-CC29,U+CC2C,U+CC2E,U+CC30,U+CC38-CC39,U+CC3B-CC3E,U+CC44-CC45,U+CC48,U+CC4C,U+CC54-CC55,U+CC57-CC59,U+CC60,U+CC64,U+CC66,U+CC68,U+CC70,U+CC75,U+CC98-CC99,U+CC9C,U+CCA0,U+CCA8-CCA9,U+CCAB-CCAD,U+CCB4-CCB5,U+CCB8,U+CCBC,U+CCC4-CCC5,U+CCC7,U+CCC9,U+CCD0,U+CCD4,U+CCE4,U+CCEC,U+CCF0,U+CD01,U+CD08-CD09,U+CD0C,U+CD10,U+CD18-CD19,U+CD1B,U+CD1D,U+CD24,U+CD28,U+CD2C,U+CD39,U+CD5C,U+CD60,U+CD64,U+CD6C-CD6D,U+CD6F,U+CD71,U+CD78,U+CD88,U+CD94-CD95,U+CD98,U+CD9C,U+CDA4-CDA5,U+CDA7,U+CDA9,U+CDB0,U+CDC4,U+CDCC,U+CDD0,U+CDE8,U+CDEC,U+CDF0,U+CDF8-CDF9,U+CDFB,U+CDFD,U+CE04,U+CE08,U+CE0C,U+CE14,U+CE19,U+CE20-CE21,U+CE24,U+CE28,U+CE30-CE31,U+CE33,U+CE35,U+CE58-CE59,U+CE5C,U+CE5F-CE61,U+CE68-CE69,U+CE6B,U+CE6D,U+CE74-CE75,U+CE78,U+CE7C,U+CE84-CE85,U+CE87,U+CE89,U+CE90-CE91,U+CE94,U+CE98,U+CEA0-CEA1,U+CEA3-CEA5,U+CEAC-CEAD,U+CEC1,U+CEE4-CEE5,U+CEE8,U+CEEB-CEEC,U+CEF4-CEF5,U+CEF7-CEF9,U+CF00-CF01,U+CF04,U+CF08,U+CF10-CF11,U+CF13,U+CF15,U+CF1C,U+CF20,U+CF24,U+CF2C-CF2D,U+CF2F-CF31,U+CF38,U+CF54-CF55,U+CF58,U+CF5C,U+CF64-CF65,U+CF67,U+CF69,U+CF70-CF71,U+CF74,U+CF78,U+CF80,U+CF85,U+CF8C,U+CFA1,U+CFA8,U+CFB0,U+CFC4,U+CFE0-CFE1,U+CFE4,U+CFE8,U+CFF0-CFF1,U+CFF3,U+CFF5,U+CFFC,U+D000,U+D004,U+D011,U+D018,U+D02D,U+D034-D035,U+D038,U+D03C,U+D044-D045,U+D047,U+D049,U+D050,U+D054,U+D058,U+D060,U+D06C-D06D,U+D070,U+D074,U+D07C-D07D,U+D081,U+D0A4-D0A5,U+D0A8,U+D0AC,U+D0B4-D0B5,U+D0B7,U+D0B9,U+D0C0-D0C1,U+D0C4,U+D0C8-D0C9,U+D0D0-D0D1,U+D0D3-D0D5,U+D0DC-D0DD,U+D0E0,U+D0E4,U+D0EC-D0ED,U+D0EF-D0F1,U+D0F8,U+D10D,U+D130-D131,U+D134,U+D138,U+D13A,U+D140-D141,U+D143-D145,U+D14C-D14D,U+D150,U+D154,U+D15C-D15D,U+D15F,U+D161,U+D168,U+D16C,U+D17C,U+D184,U+D188,U+D1A0-D1A1,U+D1A4,U+D1A8,U+D1B0-D1B1,U+D1B3,U+D1B5,U+D1BA,U+D1BC,U+D1C0,U+D1D8,U+D1F4,U+D1F8,U+D207,U+D209,U+D210,U+D22C-D22D,U+D230,U+D234,U+D23C-D23D,U+D23F,U+D241,U+D248,U+D25C,U+D264,U+D280-D281,U+D284,U+D288,U+D290-D291,U+D295,U+D29C,U+D2A0,U+D2A4,U+D2AC,U+D2B1,U+D2B8-D2B9,U+D2BC,U+D2BF-D2C0,U+D2C2,U+D2C8-D2C9,U+D2CB,U+D2D4,U+D2D8,U+D2DC,U+D2E4-D2E5,U+D2F0-D2F1,U+D2F4,U+D2F8,U+D300-D301,U+D303,U+D305,U+D30C-D30E,U+D310,U+D314,U+D316,U+D31C-D31D,U+D31F-D321,U+D325,U+D328-D329,U+D32C,U+D330,U+D338-D339,U+D33B-D33D,U+D344-D345,U+D37C-D37D,U+D380,U+D384,U+D38C-D38D,U+D38F-D391,U+D398-D399,U+D39C,U+D3A0,U+D3A8-D3A9,U+D3AB,U+D3AD,U+D3B4,U+D3B8,U+D3BC,U+D3C4-D3C5,U+D3C8-D3C9,U+D3D0,U+D3D8,U+D3E1,U+D3E3,U+D3EC-D3ED,U+D3F0,U+D3F4,U+D3FC-D3FD,U+D3FF,U+D401,U+D408,U+D41D,U+D440,U+D444,U+D45C,U+D460,U+D464,U+D46D,U+D46F,U+D478-D479,U+D47C,U+D47F-D480,U+D482,U+D488-D489,U+D48B,U+D48D,U+D494,U+D4A9,U+D4CC,U+D4D0,U+D4D4,U+D4DC,U+D4DF,U+D4E8,U+D4EC,U+D4F0,U+D4F8,U+D4FB,U+D4FD,U+D504,U+D508,U+D50C,U+D514-D515,U+D517,U+D53C-D53D,U+D540,U+D544,U+D54C-D54D,U+D54F,U+D551,U+D558-D559,U+D55C,U+D560,U+D565,U+D568-D569,U+D56B,U+D56D,U+D574-D575,U+D578,U+D57C,U+D584-D585,U+D587-D589,U+D590,U+D5A5,U+D5C8-D5C9,U+D5CC,U+D5D0,U+D5D2,U+D5D8-D5D9,U+D5DB,U+D5DD,U+D5E4-D5E5,U+D5E8,U+D5EC,U+D5F4-D5F5,U+D5F7,U+D5F9,U+D600-D601,U+D604,U+D608,U+D610-D611,U+D613-D615,U+D61C,U+D620,U+D624,U+D62D,U+D638-D639,U+D63C,U+D640,U+D645,U+D648-D649,U+D64B,U+D64D,U+D651,U+D654-D655,U+D658,U+D65C,U+D667,U+D669,U+D670-D671,U+D674,U+D683,U+D685,U+D68C-D68D,U+D690,U+D694,U+D69D,U+D69F,U+D6A1,U+D6A8,U+D6AC,U+D6B0,U+D6B9,U+D6BB,U+D6C4-D6C5,U+D6C8,U+D6CC,U+D6D1,U+D6D4,U+D6D7,U+D6D9,U+D6E0,U+D6E4,U+D6E8,U+D6F0,U+D6F5,U+D6FC-D6FD,U+D700,U+D704,U+D711,U+D718-D719,U+D71C,U+D720,U+D728-D729,U+D72B,U+D72D,U+D734-D735,U+D738,U+D73C,U+D744,U+D747,U+D749,U+D750-D751,U+D754,U+D756-D759,U+D760-D761,U+D763,U+D765,U+D769,U+D76C,U+D770,U+D774,U+D77C-D77D,U+D781,U+D788-D789,U+D78C,U+D790,U+D798-D799,U+D79B,U+D79D,U+D7B0-D7C6,U+D7CB-D7FB,U+FF01-FFBE,U+FFC2-FFC7,U+FFCA-FFCF,U+FFD2-FFD7,U+FFDA-FFDC,U+FFE0-FFE6,U+FFE8-FFEE';
  // Exact coverage of the small first-screen subset of the same Medium font.
  const starterHangul = new Set('가각간갈값같개거건것게겠겨견결경계고골곱곳공과관교구군그극근금급기긴길까께꾸꿔뀌나난날남내너넓넣념놓누는능니닌님다단닫달담답대더델도돌동돼되된될두뒤드든들듭등딩따때떤뛰라래러려력련로록료률르른를름리린림립마만말맞매먼메면명모목못무문므미밑바반받방버번범변별보복본볼부분불브비빌사산상새생서선설성세소속송수순숫스습시식신실심쎈씩아안않았앞앱야약양어업없었에여역연열예오온올옮와완외요용우운울움원월위유으은을음의이인일읽임입있자작잠장재저적전점접정제져조족존좌주준줄중즈지직진질집쪽차창찾채책처철첫청체쳤초총최출층치침칭코키킬타택터통트특틀팅판패평포표푼풀프필하학한할함합항해핵했행허험헷혀현형호화확환활회획후흐히힌');
  const starterRange = 'U+20,U+21,U+22,U+23,U+24,U+25,U+26,U+27,U+28,U+29,U+2A,U+2B,U+2C,U+2D,U+2E,U+2F,U+30,U+31,U+32,U+33,U+34,U+35,U+36,U+37,U+38,U+39,U+3A,U+3B,U+3C,U+3D,U+3E,U+3F,U+40,U+41,U+42,U+43,U+44,U+45,U+46,U+47,U+48,U+49,U+4A,U+4B,U+4C,U+4D,U+4E,U+4F,U+50,U+51,U+52,U+53,U+54,U+55,U+56,U+57,U+58,U+59,U+5A,U+5B,U+5C,U+5D,U+5E,U+5F,U+60,U+61,U+62,U+63,U+64,U+65,U+66,U+67,U+68,U+69,U+6A,U+6B,U+6C,U+6D,U+6E,U+6F,U+70,U+71,U+72,U+73,U+74,U+75,U+76,U+77,U+78,U+79,U+7A,U+7B,U+7C,U+7D,U+7E,U+A0,U+A1,U+A2,U+A3,U+A4,U+A5,U+A6,U+A7,U+A8,U+A9,U+AA,U+AB,U+AC,U+AD,U+AE,U+AF,U+B0,U+B1,U+B2,U+B3,U+B4,U+B5,U+B6,U+B7,U+B8,U+B9,U+BA,U+BB,U+BC,U+BD,U+BE,U+BF,U+C0,U+C1,U+C2,U+C3,U+C4,U+C5,U+C6,U+C7,U+C8,U+C9,U+CA,U+CB,U+CC,U+CD,U+CE,U+CF,U+D0,U+D1,U+D2,U+D3,U+D4,U+D5,U+D6,U+D7,U+D8,U+D9,U+DA,U+DB,U+DC,U+DD,U+DE,U+DF,U+E0,U+E1,U+E2,U+E3,U+E4,U+E5,U+E6,U+E7,U+E8,U+E9,U+EA,U+EB,U+EC,U+ED,U+EE,U+EF,U+F0,U+F1,U+F2,U+F3,U+F4,U+F5,U+F6,U+F7,U+F8,U+F9,U+FA,U+FB,U+FC,U+FD,U+FE,U+FF,U+100,U+101,U+102,U+103,U+110,U+111,U+112,U+113,U+11A,U+11B,U+128,U+129,U+12A,U+12B,U+143,U+144,U+147,U+148,U+14C,U+14D,U+14E,U+14F,U+152,U+153,U+168,U+169,U+16A,U+16B,U+16C,U+16D,U+192,U+1A0,U+1A1,U+1AF,U+1B0,U+1CD,U+1CE,U+1CF,U+1D0,U+1D1,U+1D2,U+1D3,U+1D4,U+1D5,U+1D6,U+1D7,U+1D8,U+1D9,U+1DA,U+1DB,U+1DC,U+1F8,U+1F9,U+2002,U+2003,U+2010,U+2011,U+2012,U+2013,U+2014,U+2015,U+2016,U+2018,U+2019,U+201A,U+201C,U+201D,U+201E,U+2020,U+2021,U+2022,U+2025,U+2026,U+2027,U+2030,U+2032,U+2033,U+2035,U+2039,U+203A,U+203B,U+203C,U+2042,U+2047,U+2048,U+2049,U+2051,U+AC00,U+AC01,U+AC04,U+AC08,U+AC12,U+AC19,U+AC1C,U+AC70,U+AC74,U+AC83,U+AC8C,U+ACA0,U+ACA8,U+ACAC,U+ACB0,U+ACBD,U+ACC4,U+ACE0,U+ACE8,U+ACF1,U+ACF3,U+ACF5,U+ACFC,U+AD00,U+AD50,U+AD6C,U+AD70,U+ADF8,U+ADF9,U+ADFC,U+AE08,U+AE09,U+AE30,U+AE34,U+AE38,U+AE4C,U+AED8,U+AFB8,U+AFD4,U+B00C,U+B098,U+B09C,U+B0A0,U+B0A8,U+B0B4,U+B108,U+B113,U+B123,U+B150,U+B193,U+B204,U+B294,U+B2A5,U+B2C8,U+B2CC,U+B2D8,U+B2E4,U+B2E8,U+B2EB,U+B2EC,U+B2F4,U+B2F5,U+B300,U+B354,U+B378,U+B3C4,U+B3CC,U+B3D9,U+B3FC,U+B418,U+B41C,U+B420,U+B450,U+B4A4,U+B4DC,U+B4E0,U+B4E4,U+B4ED,U+B4F1,U+B529,U+B530,U+B54C,U+B5A4,U+B6F0,U+B77C,U+B798,U+B7EC,U+B824,U+B825,U+B828,U+B85C,U+B85D,U+B8CC,U+B960,U+B974,U+B978,U+B97C,U+B984,U+B9AC,U+B9B0,U+B9BC,U+B9BD,U+B9C8,U+B9CC,U+B9D0,U+B9DE,U+B9E4,U+BA3C,U+BA54,U+BA74,U+BA85,U+BAA8,U+BAA9,U+BABB,U+BB34,U+BB38,U+BBC0,U+BBF8,U+BC11,U+BC14,U+BC18,U+BC1B,U+BC29,U+BC84,U+BC88,U+BC94,U+BCC0,U+BCC4,U+BCF4,U+BCF5,U+BCF8,U+BCFC,U+BD80,U+BD84,U+BD88,U+BE0C,U+BE44,U+BE4C,U+C0AC,U+C0B0,U+C0C1,U+C0C8,U+C0DD,U+C11C,U+C120,U+C124,U+C131,U+C138,U+C18C,U+C18D,U+C1A1,U+C218,U+C21C,U+C22B,U+C2A4,U+C2B5,U+C2DC,U+C2DD,U+C2E0,U+C2E4,U+C2EC,U+C388,U+C529,U+C544,U+C548,U+C54A,U+C558,U+C55E,U+C571,U+C57C,U+C57D,U+C591,U+C5B4,U+C5C5,U+C5C6,U+C5C8,U+C5D0,U+C5EC,U+C5ED,U+C5F0,U+C5F4,U+C608,U+C624,U+C628,U+C62C,U+C62E,U+C640,U+C644,U+C678,U+C694,U+C6A9,U+C6B0,U+C6B4,U+C6B8,U+C6C0,U+C6D0,U+C6D4,U+C704,U+C720,U+C73C,U+C740,U+C744,U+C74C,U+C758,U+C774,U+C778,U+C77C,U+C77D,U+C784,U+C785,U+C788,U+C790,U+C791,U+C7A0,U+C7A5,U+C7AC,U+C800,U+C801,U+C804,U+C810,U+C811,U+C815,U+C81C,U+C838,U+C870,U+C871,U+C874,U+C88C,U+C8FC,U+C900,U+C904,U+C911,U+C988,U+C9C0,U+C9C1,U+C9C4,U+C9C8,U+C9D1,U+CABD,U+CC28,U+CC3D,U+CC3E,U+CC44,U+CC45,U+CC98,U+CCA0,U+CCAB,U+CCAD,U+CCB4,U+CCE4,U+CD08,U+CD1D,U+CD5C,U+CD9C,U+CE35,U+CE58,U+CE68,U+CE6D,U+CF54,U+D0A4,U+D0AC,U+D0C0,U+D0DD,U+D130,U+D1B5,U+D2B8,U+D2B9,U+D2C0,U+D305,U+D310,U+D328,U+D3C9,U+D3EC,U+D45C,U+D47C,U+D480,U+D504,U+D544,U+D558,U+D559,U+D55C,U+D560,U+D568,U+D569,U+D56D,U+D574,U+D575,U+D588,U+D589,U+D5C8,U+D5D8,U+D5F7,U+D600,U+D604,U+D615,U+D638,U+D654,U+D655,U+D658,U+D65C,U+D68C,U+D68D,U+D6C4,U+D750,U+D788,U+D78C';
  const mediumCorePoints = new Set();
  for (const range of mediumCoreRange.split(',')) {
    const [start, end = start] = range.slice(2).split('-').map(value => parseInt(value, 16));
    for (let point = start; point <= end; point++) mediumCorePoints.add(point);
  }
  // The extension is precisely the remaining modern Hangul syllables.
  const mediumExtensionRanges = [];
  for (let point = 0xAC00; point <= 0xD7A3; point++) {
    if (mediumCorePoints.has(point)) continue;
    const start = point;
    while (point < 0xD7A3 && !mediumCorePoints.has(point + 1)) point++;
    mediumExtensionRanges.push('U+' + start.toString(16) + (start === point ? '' : '-' + point.toString(16)));
  }
  const mediumExtensionRange = mediumExtensionRanges.join(',');
  const fontLoads = new Map();
  const fontPending = new Map();
  let mediumReady = 0, mediumFullFace = null;
  async function pendingFont(weight, task) {
    const name = weight === 500 ? 'ds-study-font-pending' : 'ds-exam-font-pending';
    fontPending.set(name, (fontPending.get(name) || 0) + 1);
    document.documentElement.classList.add(name);
    try { return await task(); }
    finally {
      const count = fontPending.get(name) - 1;
      fontPending.set(name, count);
      if (!count) document.documentElement.classList.remove(name);
    }
  }
  // Only an in-flight/successful resource is memoized. A later explicit request can
  // recover after a network failure; there is no automatic retry loop.
  function loadExamFace(key, filename, weight, unicodeRange) {
    if (fontLoads.has(key)) return fontLoads.get(key);
    const controller = new AbortController();
    let timer, expired = false;
    const request = fetch(new URL(filename, fontDirectory), {cache: 'force-cache', signal: controller.signal})
      .then(response => {
        if (!response.ok) throw Error('문항 글꼴 로드 실패');
        return response.arrayBuffer();
      })
      .then(bytes => new FontFace(examFontFamily, bytes, {weight: String(weight), ...(unicodeRange ? {unicodeRange} : {})}).load())
      .then(face => {
        if (expired) return null;
        // A late subset must not override the full font's Jamo shaping choice.
        if (!mediumFullFace || !key.startsWith('medium:')) document.fonts.add(face);
        if (key === 'medium:start') mediumReady |= 8;
        if (key === 'medium:core') mediumReady |= 9;
        if (key === 'medium:extension') mediumReady |= 2;
        if (key === 'full:500') { mediumReady = 15; mediumFullFace = face; }
        return face;
      });
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => { expired = true; controller.abort(); resolve(null); }, 3500);
    });
    const promise = Promise.race([request, timeout]).catch(() => null).then(face => {
      if (!face && fontLoads.get(key) === promise) fontLoads.delete(key);
      return face;
    }).finally(() => clearTimeout(timer));
    fontLoads.set(key, promise);
    return promise;
  }
  // Preserve the public single-FontFace contract, including callers of weight 500.
  function examFont(weight = 400) {
    return pendingFont(weight, () => loadExamFace('full:' + weight,
      weight === 500 ? 'NotoSerifKR-Medium.woff2' : 'NotoSerifKR-Regular.woff2', weight));
  }
  function waitForFont(promise, wait) {
    let timer;
    return Promise.race([promise, new Promise(resolve => { timer = setTimeout(() => resolve(null), wait); })])
      .finally(() => clearTimeout(timer));
  }
  function needsExtension(text) {
    for (const character of text) {
      const point = character.codePointAt(0);
      if (point >= 0xAC00 && point <= 0xD7A3 && !mediumCorePoints.has(point)) return true;
    }
    return false;
  }
  // Split unicode ranges do not preserve every conjoining-Jamo shaping cluster.
  // Keep the source text intact and use the original font for those rare inputs.
  const needsFullFont = text => /[\u1100-\u11FF\uA960-\uA97F\uD7B0-\uD7FF]/.test(text);
  function fontRequirement(text) {
    if (needsFullFont(text)) return 4;
    if (needsExtension(text)) return 3;
    for (const c of text) {
      const n = c.codePointAt(0);
      if (mediumCorePoints.has(n) && n >= 0x1100 && !(n >= 0x2000 && n <= 0x218f) && !starterHangul.has(c)) return 1;
    }
    return 8;
  }
  function ensureExamFaces(text = '', required = fontRequirement(text)) {
    if (mediumFullFace) return Promise.resolve([mediumFullFace]);
    if (required & 4) return pendingFont(500, async () => {
      const full = await loadExamFace('full:500', 'NotoSerifKR-Medium.woff2', 500);
      return full ? [full] : [];
    });
    const needExtension = Boolean(required & 2);
    const task = async () => {
      const deadline = performance.now() + 3500;
      const requests = required === 8 && !(mediumReady & 1)
        ? [loadExamFace('medium:start', 'NotoSerifKR-Medium-start.woff2?v=e6306689c064', 500, starterRange)]
        : [loadExamFace('medium:core', 'NotoSerifKR-Medium-core.woff2', 500, mediumCoreRange)];
      if (needExtension) requests.push(loadExamFace('medium:extension', 'NotoSerifKR-Medium-extension.woff2', 500, mediumExtensionRange));
      const faces = await Promise.all(requests);
      if (mediumFullFace) return [mediumFullFace];
      if (faces.every(Boolean)) return faces;
      // One bounded original-font fallback, within the same visibility deadline.
      const remaining = deadline - performance.now();
      if (remaining > 50) {
        const full = await waitForFont(loadExamFace('full:500', 'NotoSerifKR-Medium.woff2', 500), remaining);
        if (full) return [full];
      }
      return faces.filter(Boolean);
    };
    return (mediumReady & required) === required ? task() : pendingFont(500, task);
  }
  const fontScreens = '.ds-timed, .ssp-prompt, .ssp-solution, .ssp-hint, .ssil-main';
  let fontMountQueued = false, fontMountBusy = false, fontMountRequired = 0;
  let fontMountRequested = 0, fontMountAttempt = -Infinity;
  function mountFonts() {
    if (fontMountBusy || (mediumReady & fontMountRequired) === fontMountRequired) return;
    if (fontMountRequested === fontMountRequired && performance.now() - fontMountAttempt < 30000) return;
    fontMountBusy = true;
    fontMountRequested = fontMountRequired;
    fontMountAttempt = performance.now();
    ensureExamFaces('', fontMountRequested).finally(() => {
      fontMountBusy = false;
      // A rare glyph can be inserted while the core request is still running.
      if (fontMountRequired !== fontMountRequested) mountFonts();
    });
  }
  const fontMount = new MutationObserver(records => {
    if (mediumFullFace) return;
    let relevant = false;
    for (const record of records) {
      const inside = (record.target.nodeType === 1 ? record.target : record.target.parentElement)?.closest(fontScreens);
      const nodes = record.type === 'characterData' ? [record.target] : record.addedNodes;
      for (const node of nodes) {
        if (!inside && !node.matches?.(fontScreens) && !node.querySelector?.(fontScreens)) continue;
        relevant = true;
        const text = node.textContent || '';
        fontMountRequired |= fontRequirement(text);
      }
    }
    if (!relevant) return;
    if (fontMountQueued) return;
    fontMountQueued = true;
    queueMicrotask(() => {
      fontMountQueued = false;
      mountFonts();
    });
  });
  // Keep watching: later hints, answers and next questions may need the extension.
  fontMount.observe(document.documentElement, {childList: true, characterData: true, subtree: true});
  const questionTypography = `
    body article{font-size:var(--ds-fragment-size,var(--ds-q-size,16px));font-family:var(--ds-q-serif,"Noto Serif KR","Nanum Myeongjo","AppleMyungjo",Batang,serif);line-height:var(--ds-fragment-lh,var(--ds-q-lh,1.69));word-break:keep-all;overflow-wrap:break-word}
    body :is(.katex,math){font-size:1em}
    article .katex:not(.katex-display>.katex){margin-inline:.06em}
    article :is(.bogi,.cond-box){position:relative;box-sizing:border-box;min-width:0;border:1px solid #736f66;padding:.85em .9em;margin:1.15em 0 .8em;break-inside:avoid}
    article .bogi:has(>.bt),article .cond-box:has(>.상자딱지){padding-top:1em}
    article .bogi>.bt,article .cond-box>.상자딱지{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);padding:0 .55em;background:#fff;color:inherit;font-weight:600;line-height:1.15;white-space:nowrap}
    article :is(.bogi .brow,.cond-box .cond-line){margin:0;line-height:1.69}
    article .brow+.brow,article .cond-line+.cond-line{margin-top:.22em}
    .dte-source-choices .dte-inline-choice{font-size:inherit;align-items:center}
    .dte-source-choices .dte-choice-no{box-sizing:border-box;font-size:1em;line-height:inherit;inline-size:auto;block-size:auto;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;align-self:center}
    .dte-source-choices .dte-choice-content{line-height:inherit}
  `;
  function applyTypography(doc){
    if(!doc?.head||doc===document||doc.getElementById('ds-study-math-size'))return;
    const style=doc.createElement('style');style.id='ds-study-math-size';
    style.textContent=questionTypography;doc.head.append(style);
  }
  // Resolve viewport-relative type in the host, not the narrower iframe viewport.
  function syncTypography(frame,doc) {
    const source=frame.closest('.dst-prompt,.ssp-prompt,.ssp-hint,.ssp-solution') || frame.parentElement;
    if (!source || !doc?.body) return;
    const cs=getComputedStyle(source),root=doc.documentElement.style;
    root.setProperty('--ds-fragment-size',cs.fontSize);
    root.setProperty('--ds-q-serif',cs.fontFamily);
    root.setProperty('--ds-fragment-lh',String(parseFloat(cs.lineHeight)/parseFloat(cs.fontSize) || 1.69));
    doc.body.style.fontSize=cs.fontSize;
    doc.body.style.fontFamily=cs.fontFamily;
    doc.body.style.fontWeight=cs.fontWeight;
    doc.body.style.lineHeight=cs.lineHeight;
    doc.body.style.letterSpacing=cs.letterSpacing;
  }
  // 1125 렌더고침(F5): 공부하기 문항도 뽑기 · 인쇄와 같은 한 길(MathML → 원본 TeX → KaTeX 0.18.4 · 형 1122 「같은 기준」)로 짓는다.
  // 엔진이 없거나 실패하면 지금처럼 원래 MathML 을 그대로 둔다(수학 내용 바꿈 0).
  function canonicalMath(template) {
    const R = window.WebMathRendererV23;
    if (!R || typeof R.typeset !== 'function' || !window.katex || !template.content.querySelector('math')) return template.innerHTML;
    const host = document.createElement('div');
    host.hidden = true;
    host.setAttribute('aria-hidden', 'true');
    host.append(template.content.cloneNode(true));
    document.body.append(host);
    try { R.typeset(host); return host.innerHTML; } catch { return template.innerHTML; } finally { host.remove(); }
  }
  function render(html, title) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script,iframe,frame,frameset,embed,object,base,meta,link,form,button,input,video,audio,template,foreignObject,animate,animateMotion,animateTransform,set').forEach(node => node.remove());
    for (const el of template.content.querySelectorAll('*')) {
      for (const attribute of Array.from(el.attributes)) {
        const key = attribute.name.toLowerCase();
        if (key.startsWith('on') || ['srcdoc','target','download','action','formaction','srcset','ping','autofocus','contenteditable'].includes(key)) el.removeAttribute(attribute.name);
        if (['href','xlink:href','src'].includes(key) && !(attribute.value.startsWith('#') || (/^(?:img|image)$/i.test(el.localName) && /^data:image\/(?:png|jpeg|gif|webp|svg\+xml)[;,]/i.test(attribute.value)))) el.removeAttribute(attribute.name);
      }
    }
    const base = 'html,body{margin:0;height:auto;min-height:0}body{display:flow-root;color:#171923;background:white;line-height:1.6;overflow-wrap:break-word}img,svg{max-width:100%}img{height:auto}@media print{body{color:black}}';
    // R-112: a formula is never broken, on screen or in print.
    const layout = '<style>.katex-display{max-width:100%;overflow-x:auto;overflow-y:hidden;padding-block:.25em} @media print{.katex-display{overflow:visible}}</style>';
    const doc = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+attr(policy)+'"><style>'+base+'</style></head><body class="ds-render">'+withMath(expand(canonicalMath(template)))+layout+'<style id="ds-render-rules">'+renderRules()+'</style><style id="ds-study-math-size">'+questionTypography+'</style></body></html>';
    return '<iframe class="ds-student-fragment" title="'+attr(title)+'" sandbox="allow-same-origin" referrerpolicy="no-referrer" style="display:block;width:100%;min-width:0;height:'+(lastHeight.get(title)||'12rem')+';border:0;background:white" srcdoc="'+attr(doc)+'"></iframe>';
  }
  // v66: the frame gets the same canonical render rules as the page (draw-math-v61.css, one source):
  // read once from the page's own stylesheet, no second copy to keep in step.
  let rulesText = null;
  function renderRules() {
    if (rulesText !== null) return rulesText;
    try {
      const sheet = Array.from(document.styleSheets).find(item => /\/draw-math-v61\.css(?:\?|$)/.test(item.href || ''));
      if (!sheet) return '';
      rulesText = Array.from(sheet.cssRules, rule => rule.cssText).join('\n');
    } catch { return ''; }
    return rulesText;
  }
  // v66: every server answer repeats the same ~370KB math stylesheet (fonts inlined). Keep ONE copy and hold
  // the question as its ~1KB body; the frame gets the stylesheet back when it is drawn (render → expand).
  const shared = new Map();
  const BIG_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  function compact(html) {
    if (typeof html !== 'string' || html.length < 50000) return html;
    return html.replace(BIG_STYLE, (whole, css) => {
      if (css.length < 50000 || !/KaTeX_Main/.test(css) || !/@font-face/.test(css)) return whole;
      const key = css.length + ':' + css.slice(0, 64) + css.slice(-64);
      let id = shared.get(key)?.id;
      if (!id) { id = 'm' + shared.size; shared.set(key, { id, css }); }
      return '<style data-ds-shared-math="' + id + '"></style>';
    });
  }
  function expand(html) {
    if (!shared.size || !html.includes('data-ds-shared-math')) return html;
    const byId = new Map(Array.from(shared.values(), entry => [entry.id, entry.css]));
    return html.replace(/<style data-ds-shared-math="(m\d+)"><\/style>/g, (whole, id) => byId.has(id) ? '<style>' + byId.get(id) + '</style>' : '');
  }
  // Sandboxed srcdoc frames need the self-contained stylesheet (font-src data:).
  // Ordinary screens load just the fonts they use.
  const mathEmbedURL = new URL('assets/vendor/katex-0.18.4/katex-embed.css?v=24.3', document.baseURI);
  let mathEmbedRequest;
  function mathEmbed() {
    if (!mathEmbedRequest) mathEmbedRequest = fetch(mathEmbedURL).then(response => {
      if (!response.ok) throw Error('수식 서체를 불러오지 못했습니다.');
      return response.text();
    }).catch(error => { mathEmbedRequest = null; throw error; });
    return mathEmbedRequest;
  }
  function withMath(html) {
    if (/KaTeX_Main|<style data-ds-screen-math/.test(html) || !/class="katex/.test(html)) return html;
    return '<style data-ds-frame-math></style>' + html;
  }
  // The host already owns the canonical layout rules and the versioned KaTeX
  // faces. A sandboxed frame may share those FontFace objects without links
  // or external URLs in its content. Older engines use the self-contained CSS.
  let frameMath;
  function screenMathStyle() {
    if (frameMath) return frameMath.markup;
    try {
      const sheet = document.querySelector('link[data-ds-katex-version]')?.sheet;
      if (!sheet || !/\/katex-0\.18\.4\/katex-screen\.css$/.test(new URL(sheet.href).pathname)) return '';
      const rules = Array.from(sheet.cssRules);
      const fontRules = rules.filter(rule => rule.type === CSSRule.FONT_FACE_RULE);
      const faces = Array.from(document.fonts).filter(face => fontRules.some(rule =>
        rule.style.fontFamily === face.family && rule.style.fontStyle === face.style && rule.style.fontWeight === face.weight));
      if (faces.length !== 20 || fontRules.length !== 20) return '';
      const layout = rules.filter(rule => rule.type !== CSSRule.FONT_FACE_RULE).map(rule => rule.cssText).join('\n');
      if (!layout.includes('.katex')) return '';
      frameMath = {faces, markup:'<style data-ds-screen-math>' + layout + '</style>'};
      return frameMath.markup;
    } catch { return ''; }
  }
  async function shareScreenMath(doc, style) {
    try {
      for (const face of frameMath.faces) {
        doc.fonts.add(face);
        if (!doc.fonts.has(face)) throw Error('shared math face unavailable');
      }
      doc.body.getBoundingClientRect();
      const used = frameMath.faces.filter(face => face.status === 'loading' || face.status === 'error');
      await Promise.all(used.map(face => face.loaded));
    } catch {
      for (const face of frameMath?.faces || []) {
        try { doc.fonts.delete(face); } catch {}
      }
      style.textContent = await mathEmbed();
    }
  }
  const lastHeight = new Map();
  const observers = new WeakMap();
  const measured = new WeakMap();
  async function fit(frame) {
    if (measured.has(frame)) return measured.get(frame);
    const task = (async () => {
      if (frame.contentDocument?.URL !== 'about:srcdoc' || frame.contentDocument.readyState !== 'complete') {
        await new Promise((resolve,reject) => {
          const timer = setTimeout(() => reject(Error('문항 로딩 지연')),15000);
          frame.addEventListener('load',() => { clearTimeout(timer); resolve(); },{once:true});
        });
      }
      const doc = frame.contentDocument;
      if (!doc?.body) throw Error('문항 지면 없음');
      const screenStyle = doc.querySelector('style[data-ds-screen-math]');
      if (screenStyle && frameMath) await shareScreenMath(doc, screenStyle);
      const mathStyle = doc.querySelector('style[data-ds-frame-math]');
      if (mathStyle) {
        mathStyle.textContent = await mathEmbed();
        if (!frame.isConnected || frame.contentDocument !== doc) return;
      }
      const resize = () => { syncTypography(frame,doc); const box = doc.body.getBoundingClientRect(); const bottom = parseFloat(doc.defaultView.getComputedStyle(doc.body).marginBottom)||0; const height = Math.max(box.bottom+doc.defaultView.scrollY,box.top+doc.body.scrollHeight)+Math.max(0,bottom); if (height>0) { frame.style.height = Math.ceil(height+2)+'px'; if (frame.title) lastHeight.set(frame.title, frame.style.height); } };
      resize();
      if (frame.closest('.ds-timed, .ssp-prompt, .ssp-solution, .ssp-hint')) {
        const faces = await ensureExamFaces(doc.body.textContent || '');
        if (!frame.isConnected || frame.contentDocument !== doc) return;
        // Load in the parent first: the srcdoc CSP only permits data: fonts.
        for (const face of faces) doc.fonts.add(face);
      }
      await doc.fonts.ready;
      resize();
      if (!observers.has(frame) && typeof ResizeObserver==='function') {
        const observer = new ResizeObserver(resize);
        observer.observe(doc.body);
        observer.observe(frame.parentElement);
        frame.contentWindow.addEventListener('resize',resize);
        observers.set(frame,observer);
        frame.contentWindow.addEventListener('pagehide',() => observer.disconnect(),{once:true});
      }
    })();
    measured.set(frame,task);
    try { return await task; } catch(error) { measured.delete(frame); throw error; }
    finally { frame.setAttribute('data-ds-typeset', ''); }
  }
  document.addEventListener('load',event => { if (event.target?.matches?.('.ds-student-fragment')) fit(event.target).catch(() => {}); },true);
  window.DSStudentFragment = Object.freeze({render,fit,applyTypography,compact,renderRules,examFont,mathEmbed,screenMathStyle});
})();
