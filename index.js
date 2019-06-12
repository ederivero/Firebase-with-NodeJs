// Imports the Google Cloud client library.
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const app = express();
// Instantiates a client. Explicitly use service account credentials by
// specifying the private key file. All clients in google-cloud-node have this
// helper, see https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md

//Variable para guardar el id del proyecto y el filename que eso se descarga en https://cloud.google.com/docs/authentication/production#auth-cloud-implicit-nodejs
const storage = new Storage({
    projectId: 'api-project-161182547768',
    keyFilename: './CLAVE-API/Imagenes Huariques-9fe9ddb353c1.json',
});

//se crea la variable bucket que usa como referencia el link del storage
const bucket = storage.bucket('api-project-161182547768.appspot.com');

//libreria que ayuda a los req.file npm i multer
const Multer = require('multer');
//se le da atributos que guarden en la memory storage y que tenga un limite de archivo en este caso de 5mb (el tamaño es en bytes)
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});
app.listen(3000, () => {
    console.log('App listening to port 3000');
});

app.post('/upload', multer.single('imagen'), (req, res) => {
    console.log('Upload Image');

    let imagen = req.file;
    if (imagen) {
        let newFileName = `restaurantes/${imagen.originalname}_${Date.now()}`;

        let fileUpload = bucket.file(newFileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: imagen.mimetype
            }
        });
        blobStream.on('error', (error) => {
            console.log(error);
            
            res.status(200).json({message:'Something is wrong! Unable to upload at the moment.'});
        });

        blobStream.on('finish', () => {
            fileUpload.getSignedUrl({
                action:'read',
                expires: '12-12-2491'
            }).then(link =>{
                res.status(200).json({link});
            })
        });

        blobStream.end(imagen.buffer);
    }
    else
    {
        res.status(400).json({error:'No hay archivos'})
    }
});