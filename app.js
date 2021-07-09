// Elements
//=========

const cartClose = document.querySelector('.close-cart');
const clearCart = document.querySelector('#clear-cart');
const cartIcon = document.querySelector('.cart-icon');
const cartOverlay = document.querySelector('.cart-overlay');
const prouductsDiv = document.querySelector('.products')
const cartContent = document.querySelector('.cart-content')
const totalAmountDiv = document.querySelector('#cart-items')
const totalPriceDiv = document.querySelector('#total-price')


let allProducts = [];


// Cart
cartIcon.onclick = function () {
    cartOverlay.style.right = '0';
}
cartClose.onclick = () => {
    cartOverlay.style.right = '-800px';
}



// Classes
//=========

class Products {

    async getProducts() {

        try {
            let result = await fetch("products.json")
            let data = await result.json()
            let products = data.items

            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields
                const {
                    id
                } = item.sys
                const image = item.fields.image.fields.file.url

                return {
                    id,
                    title,
                    price,
                    image
                }
            })

            return products
        } catch (error) {
            console.log(error)
        }
    }
}

class UI {

    displayProducts(products, parentElement, htmlcb) {
        let result = ''
        products.forEach(product => {

            result += htmlcb(product)
        })

        parentElement.innerHTML = result
    }
}


class Cart {

    saveProducts(id) {

        let selectedProduct = allProducts.find(item => item.id === id)
        let price = selectedProduct.price

        //Get product from localstorage and and add new product
        if (localStorage.getItem('products') !== null) {

            let temp = this.getProducts()

            let inCart = temp.find(item => item.product.id === id)
            // Increse amount of same product
            if (inCart) {
                inCart.product.amount++
            } else {
                temp = [...temp, {
                    product: {
                        'id': id,
                        'amount': 1,
                        'price': price
                    }
                }]
            }

            localStorage.setItem('products', JSON.stringify(temp))

        } else {

            //If sotrage is emty Save new product in storage
            let productsIds = [{
                product: {
                    'id': id,
                    'amount': 1,
                    'price': price
                }
            }];


            let productsIdsJson = JSON.stringify(productsIds)
            localStorage.setItem('products', productsIdsJson);
        }

    }

    getProducts() {
        if (localStorage.getItem('products') == null) {
            return []
        }

        return JSON.parse(localStorage.getItem('products'))
    }

    addToCart(event) {

        let productId = event.target.dataset.id
        this.saveProducts(productId)
    }

    // Display cart products
    displayCartProducts(products) {

        ui.displayProducts(products, cartContent, product => {
            let flag = false,
                amount,
                totalAmount = 0,
                totalPrice = 0;

            let cartProducts = cart.getProducts()

            cartProducts.forEach(cartProduct => {
                let id = cartProduct.product.id
                totalAmount += cartProduct.product.amount
                totalPrice += (cartProduct.product.price * cartProduct.product.amount)

                if (product.id === id) {
                    flag = true
                    amount = cartProduct.product.amount
                    return
                }
            })
            // Upate total amount
            totalAmountDiv.innerHTML = totalAmount

            // Update total Price
            totalPriceDiv.innerHTML = totalPrice.toFixed(2)

            if (flag) {
                return `
                    <div class="cart-item">
                    <img src="${product.image}" />
    
                    <div>
                        <h4>${product.title}</h4>
                        <h5>$ ${product.price}</h5>
                        <span onclick="cart.removeProduct(this.dataset.id)" data-id= "${product.id}" class="remove-btn" >remove</span>
                    </div>
    
                    <div class="item-controls">
                        <i data-id= "${product.id}" onclick = "cart.changeAmount(this.dataset.id, event)" class="bi bi-chevron-up increse-amount"></i>
                        <span class="item-amount">${amount}</span>
                        <i data-id= "${product.id}" onclick = "cart.changeAmount(this.dataset.id, event)" class="bi bi-chevron-down decrese-amount"></i>
                    </div>
                    </div>
                    `
            } else {
                return ''
            }

        })
    }

    clearCart() {

        localStorage.removeItem('products')
        totalPriceDiv.innerHTML = '0.00'
        totalAmountDiv.innerHTML = '0'
    }

    // remove product from cart
    removeProduct(id) {

        let temp = this.getProducts()
        let index = temp.findIndex(item => item.product.id == id)

        temp.splice(index, 1)
        localStorage.setItem('products', JSON.stringify(temp))
        this.displayCartProducts(allProducts)
        console.log('removeProduct called');
    }

    // Increse or Decrese amount
    changeAmount(id, event) {

        let temp = this.getProducts()
        temp.forEach(item => {

            if (item.product.id === id) {

                if (event.target.classList.contains('increse-amount')) {
                    item.product.amount++

                } else {
                    item.product.amount--
                }

                localStorage.setItem('products', JSON.stringify(temp))
                cart.displayCartProducts(allProducts)

                if(item.product.amount < 1){
                    cart.removeProduct(id)
                }

            }
        })




    }

}


//Get Products

const products = new Products()
const ui = new UI()
const cart = new Cart()

products.getProducts().then(products => {

    allProducts = products

    // Display main products
    ui.displayProducts(products, prouductsDiv, product => {

        return `
        <div class="card" style="width: 18rem">
        <img src= "${product.image}" class="card-img-top" alt="..." />
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text">
            Some quick example text to build on the card title and make u
          </p>
          <div class="price">${product.price} &#2547;</div>
          <a  data-id = "${product.id}" class="btn btn-primary addtocartbtn">Add to Cart <span class="cart-items">0</span></a>
        </div>
      </div> 
      `
    })

    // Display cart products


    cart.displayCartProducts(products)

    let addtocartbtns = document.querySelectorAll('.addtocartbtn');
    [...addtocartbtns].forEach(btn => {

        btn.onclick = () => {

            cart.addToCart(event)
            cart.displayCartProducts(products)

        }
    })


    // Clear Cart
    clearCart.onclick = () => {
        cart.clearCart()
        cartContent.innerHTML = ''
    }

})