(() => {
    //Key Scheduling
    //Untuk melakukan pertukaran value dari key atau Passkey
    function KSA(key) {
      var key_length = key.length;
      var MOD = 256;
      var S = Array.from(Array(MOD).keys());
      var j = 0;
      for (var i = 0; i < MOD; i++) {
        j = (j + S[i] + key[i % key_length]) % MOD;
        [S[i], S[j]] = [S[j], S[i]];
      }
      return S;
    }
  
    //PSEUDO Random
    //Untuk mengubah key yang telah dilakukan pertukaran KSA menjadi Random PSEUDO
    function* PRGA(S) {
      var MOD = 256;
      var i = 0;
      var j = 0;
      while (true) {
        i = (i + 1) % MOD;
        j = (j + S[i]) % MOD;
  
        [S[i], S[j]] = [S[j], S[i]];
        var K = S[(S[i] + S[j]) % MOD];
        yield K;
      }
    }
  
    //Decrypt Logic
    function decrypt_logic(key, hexString) {
      key = Array.from(key, c => c.charCodeAt(0));
      var S = KSA(key);
      var keystream = PRGA(S);
      var encryptedBytes = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
      var res = [];
      for (var i = 0; i < encryptedBytes.length; i++) {
        var c = encryptedBytes[i];
        var val = (c ^ keystream.next().value).toString(16).padStart(2, '0').toUpperCase();
        res.push(val);
      }
      return res.join('');
    }
  
    // Hex to Array
    function hex2a(hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    }
  
    function decrypt(key, ciphertext) {
      var decrypted = decrypt_logic(key, ciphertext);
      return hex2a(decrypted);
    }
  
    function message2binary(message) {
      if (typeof message === 'string') {
        return Array.from(message, c => c.charCodeAt(0)).map(c => c.toString(2).padStart(8, '0')).join('');
      } else if (message instanceof Array || message instanceof Uint8Array) {
        return message.map(c => c.toString(2).padStart(8, '0')).join('');
      } else if (typeof message === 'number' || message instanceof Uint8Array) {
        return message.toString(2).padStart(8, '0');
      } else {
        throw new TypeError("Input type is not supported");
      }
    }
  
    function decodeData() {
      return new Promise((resolve, reject) => {
        var fileInput = document.getElementById('fileInput_dec');
        var file = fileInput.files[0];
  
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
  
        var reader = new FileReader();
        reader.onload = function (event) {
          var img = new Image();
          img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = imageData.data;
  
            var binaryData = "";
            for (var i = 0; i < pixels.length; i += 4) {
              var r = pixels[i];
              var g = pixels[i + 1];
              var b = pixels[i + 2];
  
              var binaryR = message2binary(r);
              var binaryG = message2binary(g);
              var binaryB = message2binary(b);
  
              binaryData += (binaryR[binaryR.length - 1]);
              binaryData += (binaryG[binaryG.length - 1]);
              binaryData += (binaryB[binaryB.length - 1]);
            }
  
            var allBytes = [];
            for (var i = 0; i < binaryData.length; i += 8) {
              allBytes.push(binaryData.substring(i, i + 8));
            }
  
            var decodedData = "";
            for (var i = 0; i < allBytes.length; i++) {
              var byte = allBytes[i];
              decodedData += String.fromCharCode(parseInt(byte, 2));
              if (decodedData.slice(-4) === "****") {
                break;
              }
            }
            console.log("The encoded data was:", decodedData.slice(0, -4));
            resolve(decodedData.slice(0, -4));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    const decrypt_button = document.getElementById('decrypt_button');
    decrypt_button.addEventListener('click', () => {
      var key = document.getElementById('decryptkey').value;
      console.log(key)
      decodeData().then(decodedData => {
        var decripteddata = decrypt(key, decodedData);
        document.getElementById('encryptedMessage').value = decodedData;
        document.getElementById('decryptedText').value = decripteddata;
      }).catch(error => {
        console.error("Error:", error);
      });
    });
  })();