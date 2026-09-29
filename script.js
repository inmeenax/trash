// ===============================
// WATCHPAYS TEST CONFIGURATION
// ===============================

const MERCHANT_ID = "100666048";

// DO NOT put your real live API key in a public GitHub repository.
// Use a test/sandbox key if WatchPays provides one.
const API_KEY = "18ea7129934a0912c3ad15dd313df48e";

const WATCHPAYS_API = "https://api.watchpays.com/v1/create";

// Your GitHub Pages URL.
// Replace this after GitHub Pages gives you your actual URL.
const CALLBACK_URL =
    "https://inmeenax.github.io/trash/";

// ===============================
// CREATE PAYMENT
// ===============================

async function createPayment(amount) {

    const status = document.getElementById("status");
    const buttons = document.querySelectorAll(".pay-btn");

    buttons.forEach(button => {
        button.disabled = true;
    });

    status.textContent = "Creating payment...";

    try {

        // WatchPays requires 2 decimal places
        const formattedAmount = Number(amount).toFixed(2);

        // Generate a unique merchant order number
        const merchantOrderNo =
            "TEST_" +
            Date.now() +
            "_" +
            Math.floor(Math.random() * 10000);

        // Parameters used for signature
        const params = {
            merchant_id: MERCHANT_ID,
            amount: formattedAmount,
            merchant_order_no: merchantOrderNo,
            callback_url: CALLBACK_URL
        };

        // Sort alphabetically
        const sortedKeys = Object.keys(params).sort();

        let signString = "";

        for (const key of sortedKeys) {
            const value = params[key];

            if (value !== undefined && value !== null && value !== "") {
                signString += `${key}=${value}&`;
            }
        }

        // Append API key
        signString += `key=${API_KEY}`;

        // Generate MD5 signature
        const signature = md5(signString);

        // Request body
        const requestBody = {
            merchant_id: MERCHANT_ID,
            api_key: API_KEY,
            amount: formattedAmount,
            merchant_order_no: merchantOrderNo,
            callback_url: CALLBACK_URL,
            signature: signature
        };

        console.log("Merchant Order:", merchantOrderNo);
        console.log("Signature String:", signString);

        const response = await fetch(WATCHPAYS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        console.log("WatchPays Response:", data);

        if (data.success && data.payment_url) {

            status.textContent = "Redirecting to payment...";

            window.location.href = data.payment_url;

        } else {

            status.textContent =
                "Payment creation failed: " +
                (data.message || data.error || JSON.stringify(data));

            buttons.forEach(button => {
                button.disabled = false;
            });
        }

    } catch (error) {

        console.error(error);

        status.textContent =
            "Request failed. Check browser console for details.";

        buttons.forEach(button => {
            button.disabled = false;
        });
    }
}


// =====================================================
// Minimal MD5 implementation
// =====================================================

function md5(string) {

    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) |
            (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
        const lX8 = lX & 0x80000000;
        const lY8 = lY & 0x80000000;

        const lX4 = lX & 0x40000000;
        const lY4 = lY & 0x40000000;

        const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

        if (lX4 & lY4) {
            return lResult ^ 0x80000000 ^ lX8 ^ lY8;
        }

        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
            } else {
                return lResult ^ 0x40000000 ^ lX8 ^ lY8;
            }
        }

        return lResult ^ lX8 ^ lY8;
    }

    function F(x, y, z) {
        return (x & y) | (~x & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & ~z);
    }

    function H(x, y, z) {
        return x ^ y ^ z;
    }

    function I(x, y, z) {
        return y ^ (x | ~z);
    }

    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(
            a,
            addUnsigned(
                addUnsigned(F(b, c, d), x),
                ac
            )
        );

        return addUnsigned(
            rotateLeft(a, s),
            b
        );
    }

    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(
            a,
            addUnsigned(
                addUnsigned(G(b, c, d), x),
                ac
            )
        );

        return addUnsigned(
            rotateLeft(a, s),
            b
        );
    }

    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(
            a,
            addUnsigned(
                addUnsigned(H(b, c, d), x),
                ac
            )
        );

        return addUnsigned(
            rotateLeft(a, s),
            b
        );
    }

    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(
            a,
            addUnsigned(
                addUnsigned(I(b, c, d), x),
                ac
            )
        );

        return addUnsigned(
            rotateLeft(a, s),
            b
        );
    }

    function convertToWordArray(str) {

        const messageLength = str.length;
        const numberOfWordsTemp1 = messageLength + 8;
        const numberOfWordsTemp2 =
            (numberOfWordsTemp1 - (numberOfWordsTemp1 % 64)) / 64;

        const numberOfWords = (numberOfWordsTemp2 + 1) * 16;

        const wordArray = new Array(numberOfWords - 1);

        let bytePosition = 0;
        let byteCount = 0;

        while (byteCount < messageLength) {

            const wordCount =
                (byteCount - (byteCount % 4)) / 4;

            bytePosition =
                (byteCount % 4) * 8;

            wordArray[wordCount] =
                (wordArray[wordCount] || 0) |
                (str.charCodeAt(byteCount) << bytePosition);

            byteCount++;
        }

        const wordCount =
            (byteCount - (byteCount % 4)) / 4;

        bytePosition =
            (byteCount % 4) * 8;

        wordArray[wordCount] =
            (wordArray[wordCount] || 0) |
            (0x80 << bytePosition);

        wordArray[numberOfWords - 2] =
            messageLength << 3;

        wordArray[numberOfWords - 1] =
            messageLength >>> 29;

        return wordArray;
    }

    function wordToHex(value) {

        let output = "";

        for (let i = 0; i <= 3; i++) {

            const byte =
                (value >>> (i * 8)) & 255;

            output +=
                ("0" + byte.toString(16)).slice(-2);
        }

        return output;
    }

    const x = convertToWordArray(string);

    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;

    const S11 = 7;
    const S12 = 12;
    const S13 = 17;
    const S14 = 22;

    const S21 = 5;
    const S22 = 9;
    const S23 = 14;
    const S24 = 20;

    const S31 = 4;
    const S32 = 11;
    const S33 = 16;
    const S34 = 23;

    const S41 = 6;
    const S42 = 10;
    const S43 = 15;
    const S44 = 21;

    for (let k = 0; k < x.length; k += 16) {

        const AA = a;
        const BB = b;
        const CC = c;
        const DD = d;

        a = FF(a,b,c,d,x[k+0],S11,0xD76AA478);
        d = FF(d,a,b,c,x[k+1],S12,0xE8C7B756);
        c = FF(c,d,a,b,x[k+2],S13,0x242070DB);
        b = FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);

        a = FF(a,b,c,d,x[k+4],S11,0xF57C0FAF);
        d = FF(d,a,b,c,x[k+5],S12,0x4787C62A);
        c = FF(c,d,a,b,x[k+6],S13,0xA8304613);
        b = FF(b,c,d,a,x[k+7],S14,0xFD469501);

        a = FF(a,b,c,d,x[k+8],S11,0x698098D8);
        d = FF(d,a,b,c,x[k+9],S12,0x8B44F7AF);
        c = FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b = FF(b,c,d,a,x[k+11],S14,0x895CD7BE);

        a = FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d = FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c = FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b = FF(b,c,d,a,x[k+15],S14,0x49B40821);

        a = GG(a,b,c,d,x[k+1],S21,0xF61E2562);
        d = GG(d,a,b,c,x[k+6],S22,0xC040B340);
        c = GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b = GG(b,c,d,a,x[k+0],S24,0xE9B6C7AA);

        a = GG(a,b,c,d,x[k+5],S21,0xD62F105D);
        d = GG(d,a,b,c,x[k+10],S22,0x02441453);
        c = GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b = GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);

        a = GG(a,b,c,d,x[k+9],S21,0x21E1CDE6);
        d = GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c = GG(c,d,a,b,x[k+3],S23,0xF4D50D87);
        b = GG(b,c,d,a,x[k+8],S24,0x455A14ED);

        a = GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d = GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8);
        c = GG(c,d,a,b,x[k+7],S23,0x676F02D9);
        b = GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);

        a = HH(a,b,c,d,x[k+5],S31,0xFFFA3942);
        d = HH(d,a,b,c,x[k+8],S32,0x8771F681);
        c = HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b = HH(b,c,d,a,x[k+14],S34,0xFDE5380C);

        a = HH(a,b,c,d,x[k+1],S31,0xA4BEEA44);
        d = HH(d,a,b,c,x[k+4],S32,0x4BDECFA9);
        c = HH(c,d,a,b,x[k+7],S33,0xF6BB4B60);
        b = HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);

        a = HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d = HH(d,a,b,c,x[k+0],S32,0xEAA127FA);
        c = HH(c,d,a,b,x[k+3],S33,0xD4EF3085);
        b = HH(b,c,d,a,x[k+6],S34,0x04881D05);

        a = HH(a,b,c,d,x[k+9],S31,0xD9D4D039);
        d = HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c = HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b = HH(b,c,d,a,x[k+2],S34,0xC4AC5665);

        a = II(a,b,c,d,x[k+0],S41,0xF4292244);
        d = II(d,a,b,c,x[k+7],S42,0x432AFF97);
        c = II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b = II(b,c,d,a,x[k+5],S44,0xFC93A039);

        a = II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d = II(d,a,b,c,x[k+3],S42,0x8F0CCC92);
        c = II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b = II(b,c,d,a,x[k+1],S44,0x85845DD1);

        a = II(a,b,c,d,x[k+8],S41,0x6FA87E4F);
        d = II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c = II(c,d,a,b,x[k+6],S43,0xA3014314);
        b = II(b,c,d,a,x[k+13],S44,0x4E0811A1);

        a = II(a,b,c,d,x[k+4],S41,0xF7537E82);
        d = II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c = II(c,d,a,b,x[k+2],S43,0x2AD7D2BB);
        b = II(b,c,d,a,x[k+9],S44,0xEB86D391);

        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    return (
        wordToHex(a) +
        wordToHex(b) +
        wordToHex(c) +
        wordToHex(d)
    ).toLowerCase();
}
