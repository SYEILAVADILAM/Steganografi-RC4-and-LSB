(() => {
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
  
    function get_keystream(key) {
      S = KSA(key);
      return PRGA(S);
    }
  
    function encrypt_logic(key, str) {
      key = Array.from(key, c => c.charCodeAt(0));
      var keystream = get_keystream(key);
      var res = [];
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        var val = (c ^ keystream.next().value).toString(16).padStart(2, '0').toUpperCase();
        res.push(val);
      }
      return res.join('');
    }

    function encrypt(key, plaintext) {
      return encrypt_logic(key, plaintext);
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
  
    function encodeData(data) {
      var fileInput = document.getElementById('fileInput_enc');
      var file = fileInput.files[0];
  
      if (!file) {
        alert('No file selected');
        return;
      }
  
      var reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var pixels = imageData.data;
  
          // Perform your encoding logic here
          data += '*****'
          var dataBinary = message2binary(data);
          data_len = dataBinary.length;
          data_index = 0;
          console.log(data_len);
          console.log(pixels.length);
          // Example of encoding the first pixel's red channel
          // var pixelIndex = 0;
          // var r = pixels[pixelIndex];
          // pixels[pixelIndex] = (r & 0xFE) | parseInt(dataBinary.charAt(0), 2);
          var list1 = [];
  
          for (var i = 0; i < pixels.length; i += 4) {
            var r = pixels[i];
            var g = pixels[i + 1];
            var b = pixels[i + 2];
            var pixel = [r, g, b];
  
            var binaryR = message2binary(r);
            var binaryG = message2binary(g);
            var binaryB = message2binary(b);
  
            // Modify pixel values if there is more data to encode
            if (data_index < data_len) {
              console.log("The old pixel " + pixel[0]);
              pixel[0] = parseInt(binaryR.slice(0, -1) + dataBinary[data_index], 2);
              console.log("Change binary of R " + binaryR.slice(0, -1) + dataBinary[data_index]);
  
              data_index++;
              list1.push(pixel[0]);
            }
  
            if (data_index < data_len) {
              console.log("The old pixel " + pixel[1]);
              pixel[1] = parseInt(binaryG.slice(0, -1) + dataBinary[data_index], 2);
              console.log("Change binary of G " + binaryG.slice(0, -1) + dataBinary[data_index]);
              data_index++;
              list1.push(pixel[1]);
            }
  
            if (data_index < data_len) {
              console.log("The old pixel " + pixel[2]);
              pixel[2] = parseInt(binaryB.slice(0, -1) + dataBinary[data_index], 2);
              console.log("Change binary of B " + binaryB.slice(0, -1) + dataBinary[data_index]);
              data_index++;
              list1.push(pixel[2]);
            }
  
            if (data_index >= data_len) {
              break;
            }
  
            // Set modified pixel back to image data
            imageData.data[i] = pixel[0];
            imageData.data[i + 1] = pixel[1];
            imageData.data[i + 2] = pixel[2];
            console.log(imageData.data[i], pixel[0])
          }
          console.log(data);
  
          ctx.putImageData(imageData, 0, 0);
  
          // Save the modified image
          var modifiedImage = canvas.toDataURL('image/png');
          var a = document.createElement('a');
          a.href = modifiedImage;
          a.download = 'encoded_image.png';
          a.click();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    const encrypt_button = document.getElementById('encrypt_button');
    encrypt_button.addEventListener('click', () => {
      var key = document.getElementById('encryptkey').value;
      var plaintext = document.getElementById('messageToEncrypt').value;
      var ciphertext = encrypt(key, plaintext);
      document.getElementById('encryptedText').value = 'Your message has ben injected into the image with RC4 Encryption : ' + ciphertext;
      encodeData(ciphertext);
    });
  })();