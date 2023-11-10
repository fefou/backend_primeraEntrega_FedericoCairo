const { Router } = require('express')
const routerC = Router()
const carritosJSON = require('../json/carritos.json')
const productosJSON = require('../json/productos.json')
const fs = require('fs')
const path = require('path')
let ruta = path.join(__dirname, '..', 'json', 'carritos.json')


function saveProducts(carritos) {
    fs.writeFileSync(ruta, JSON.stringify(carritos, null, 5))
}

// GET CARRITO

routerC.get('/', (req, res) => {
    let resultado = carritosJSON

    if (req.query.limit) {
        resultado = resultado.slice(0, req.query.limit)
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ filtros: req.query, resultado });
});

routerC.get('/:cid', (req, res) => {

    let cid = req.params.cid
    // console.log(id, 2)
    cid = parseInt(cid)
    if (isNaN(cid)) {
        return res.send('Error, ingrese un argumento id numerico')
    }


    resultado = carritosJSON.find(per => per.cid === cid)

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ resultado });
})

// POST CARRITO con id y array de productos vacio SIN timestamp

routerC.post('/', (req, res) => {
    let carritos = carritosJSON;

    let id = 1;
    if (carritos.length > 0) {
        id = carritos[carritos.length - 1].id + 1;
    }

    let productos = [];
    
    let nuevoCarrito = {
        id, productos
    };

    carritos.push(nuevoCarrito);
    saveProducts(carritos);

    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ nuevoCarrito });

})

//  el POST /:cid/productos/:pid debe agregar un produto al array carrito que tenga la id del producto agregado y la cantidad de veces que ese producto esta en el carrito ("quantity")

routerC.post('/:cid/productos/:pid', (req, res) => {

    let cid = req.params.cid
    let pid = req.params.pid
    // console.log(id, 2)
    cid = parseInt(cid)
    pid = parseInt(pid)
    if (isNaN(cid) || isNaN(pid)) {
        return res.send('Error, ingrese un argumento id numerico')
    }

    let carritos = carritosJSON;
    let productos = productosJSON;

    let carrito = carritos.find(carrito => carrito.id === cid);
    let producto = productos.find(producto => producto.id === pid);

    if (!carrito) {
        return res.status(404).json({ error: `No existe el carrito con id ${cid}` });
    }

    if (!producto) {
        return res.status(404).json({ error: `No existe el producto con id ${pid}` });
    }

    // si ya existe un producto entonces sumarle 1 a la cantidad
    let existe = carrito.productos.find(producto => producto.id === pid);
    if (existe) {
        existe.quantity++;
        saveProducts(carritos);
        return res.status(201).json({ existe });        
    }

    let nuevoProducto = {
        id: producto.id,       
        quantity: 1
    };

    carrito.productos.push(nuevoProducto);
    saveProducts(carritos);

    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json({ nuevoProducto });
})




module.exports = routerC