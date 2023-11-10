const { Router } = require('express')
const routerP = Router()
const productosJSON = require('../json/productos.json')
const fs = require('fs')
const path = require('path')
let ruta = path.join(__dirname, '..', 'json', 'productos.json')



function saveProducts(productos) {
    fs.writeFileSync(ruta, JSON.stringify(productos, null, 5))
}



routerP.get('/', (req, res) => {
    let resultado = productosJSON

    if (req.query.limit) {
        resultado = resultado.slice(0, req.query.limit)
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ filtros: req.query, resultado });
});

routerP.get('/:id', (req, res) => {

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

routerP.post('/', (req, res) => {
    let { title, description, price, code, stock, category } = req.body;
    let thumbnails = req.body.thumbnails || [];
    let status = req.body.status !== undefined ? req.body.status : true;

    if (!title || !price || !code || !stock || !category) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Title, price, code y stock son datos obligatorios.` });
    }

    let productos = productosJSON;
    let existe = productos.find(producto => producto.title === title || producto.code === code);
    if (existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `El titulo ${title} o codigo ${code} ya existe en BD` });
    }

    let id = 1;
    if (productos.length > 0) {
        id = productos[productos.length - 1].id + 1;
    }

    let nuevoProducto = {
        id, title, description, price, code, stock, status, thumbnails
    };

    productos.push(nuevoProducto);
    saveProducts(productos);

    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ nuevoProducto });
});


// UPDATE

routerP.put('/:id', (req, res) => {

    let { id } = req.params
    id = parseInt(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ error: `Indique un id numérico` });
    }

    let productos = productosJSON
    let indiceProducto = productos.findIndex(producto => producto.id === id)
    if (indiceProducto === -1) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existen productos con id ${id}` });
    }

    let propsPermitidas = ["title", "description", "price", "code", "stock", "thumbnails"]

    let propsQueLlegan = Object.keys(req.body)
    let valido = propsQueLlegan.every(propiedad => propsPermitidas.includes(propiedad))

    if (!valido) {
        res.setHeader('Content-Type', 'application.json')
        return res.status(400).json({ error: `No se aceptan algunas props`, propsPermitidas })
    }

    let productoModificado = {
        ...productos[indiceProducto],
        ...req.body,
        id
    }

    productos[indiceProducto] = productoModificado

    saveProducts(productos)


    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        productoModificado
    });
});


// DELETE 

routerP.delete('/:id', (req, res) => {

    let { id } = req.params
    id = parseInt(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ error: `Indique un id numérico` });
    }

    let productos = productosJSON
    let indiceProducto = productos.findIndex(producto => producto.id === id)
    if (indiceProducto === -1) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existen productos con id ${id}` });
    }

    let productoEliminado = productos.splice(indiceProducto, 1)

    saveProducts(productos)

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        productoEliminado
    });
});




module.exports = routerP