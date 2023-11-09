const express = require('express')
const app = express()
const port = 8080
const fs = require('fs')
const productosJSON = require('./json/productos.json')
const path = require('path')
let ruta = path.join(__dirname, 'json', 'productos.json')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function saveProducts(productos) {
    fs.writeFileSync(ruta, JSON.stringify(productos, null, 5))
}


// GET 

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
})


app.get('/api/productos', (req, res) => {
    let resultado = productosJSON

    if (req.query.limit) {
        resultado = resultado.slice(0, req.query.limit)
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ filtros: req.query, resultado });
});

app.get('/api/productos/:id', (req, res) => {

    let id = req.params.id
    // console.log(id, 2)
    id = parseInt(id)
    if (isNaN(id)) {
        return res.send('Error, ingrese un argumento id numerico')
    }


    resultado = productosJSON.find(per => per.id === id)

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ resultado });
})


// POST

app.post('/api/productos', (req, res) => {
    let { title, description, price, code, stock } = req.body
    let thumbnails = req.body.thumbnails || [];

    if (!title || !price || !code || !stock) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Title, price, code y stock son datos obligatorios.` })
    }

    let productos = productosJSON
    let existe = productos.find(producto => producto.title === title || producto.code === code)
    if (existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `El titulo ${title} o codigo ${code} ya existe en BD` })
    }

    let id = 1
    if (productos.length > 0) {
        id = productos[productos.length - 1].id + 1
    }

    let nuevoProducto = {
        id, title, description, price, code, stock, thumbnails
    }

    productos.push(nuevoProducto)
    saveProducts(productos)

    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ nuevoProducto })
})


// UPDATE

app.put('/api/productos/:id', (req, res) => {

    let { id } = req.params
    id = parseInt(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ error: `Indique un id numérico` });
    }

    let productos = productosJSON
    let indiceProducto = productos.findIndex(producto => producto.id === id)
    if(indiceProducto===-1){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existen productos con id ${id}` });
    }

    let propsPermitidas=["title", "description", "price", "code", "stock", "thumbnails"]

    let propsQueLlegan=Object.keys(req.body)
    let valido=propsQueLlegan.every(propiedad=>propsPermitidas.includes(propiedad))

    if(!valido){
        res.setHeader('Content-Type','application.json')
        return res.status(400).json({error:`No se aceptan algunas props`, propsPermitidas})    
    }

    let productoModificado={
        ...productos[indiceProducto],
        ...req.body,
        id
    }

    productos[indiceProducto]=productoModificado

    saveProducts(productos)


    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        productoModificado
    });
});


// DELETE 

app.delete('/api/productos/:id',(req,res)=>{

    let { id } = req.params
    id = parseInt(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ error: `Indique un id numérico` });
    }

    let productos = productosJSON
    let indiceProducto = productos.findIndex(producto => producto.id === id)
    if(indiceProducto===-1){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existen productos con id ${id}` });
    }
    
    let productoEliminado=productos.splice(indiceProducto,1)

    saveProducts(productos)

    res.setHeader('Content-Type','application/json');
    res.status(200).json({
        productoEliminado
    });
});





app.listen(port, () => {
    console.log(`Server funcionando con Express en el puerto ${port}`);
});


