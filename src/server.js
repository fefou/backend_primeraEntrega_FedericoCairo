const express = require('express')
const app = express()
const port = 8080
const productosRouter = require('./routes/productosRouter.js')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h2>Home</h2>');
})

app.use('/api/productos', productosRouter)

app.listen(port, () => {
    console.log(`Server funcionando con Express en el puerto ${port}`);
});