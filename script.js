// ============================================
// COCO CARTEL — INTERACTIVE SCRIPTS
// ============================================

document.addEventListener('DOMContentLoaded', function () {


// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================

const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}


// ============================================
// MOBILE MENU
// ============================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');


if (hamburger && navLinks) {

  hamburger.addEventListener('click', function () {

    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');

  });


  document.querySelectorAll('.nav-link').forEach(link => {

    link.addEventListener('click', function () {

      hamburger.classList.remove('active');
      navLinks.classList.remove('active');

    });

  });

}


// ============================================
// SCROLL REVEAL
// ============================================

const fadeElements = document.querySelectorAll('.fade-in');


if (fadeElements.length > 0) {


const observer = new IntersectionObserver((entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){

entry.target.classList.add('visible');

observer.unobserve(entry.target);

}


});


},{
threshold:0.1
});


fadeElements.forEach(el=>{

observer.observe(el);

});


}



// ============================================
// SMOOTH SCROLL
// ============================================


document.querySelectorAll('a[href^="#"]').forEach(anchor=>{


anchor.addEventListener('click',function(e){


e.preventDefault();


const target=document.querySelector(
this.getAttribute('href')
);


if(target){

window.scrollTo({

top: target.offsetTop - 80,

behavior:'smooth'

});

}


});


});



// ============================================
// CART + WISHLIST STORAGE
// ============================================


let cart = JSON.parse(localStorage.getItem('cocoCart')) || [];

let wishlist = JSON.parse(localStorage.getItem('cocoWishlist')) || [];





function saveCart(){

localStorage.setItem(
'cocoCart',
JSON.stringify(cart)
);

}



function saveWishlist(){

localStorage.setItem(
'cocoWishlist',
JSON.stringify(wishlist)
);

}




function updateCartCount(){

const count = document.getElementById('cartCount');


if(count){

count.textContent = cart.length;

}


}


updateCartCount();





// ============================================
// ADD TO CART BUTTONS
// ============================================


const cartButtons = document.querySelectorAll('.product-add-btn');



cartButtons.forEach(button=>{


button.addEventListener('click',function(){


const card = this.closest('.product-card');


const product = {


name:
card.querySelector('.product-card-name').textContent,


price:
card.querySelector('.product-card-price').textContent,


image:
card.querySelector('img').src


};



cart.push(product);


saveCart();


updateCartCount();



alert(
product.name + ' added to cart'
);



});


});




// ============================================
// ADD TO WISHLIST BUTTONS
// ============================================


const wishlistButtons =
document.querySelectorAll('.product-wishlist-btn');



wishlistButtons.forEach(button=>{


button.addEventListener('click',function(){


const card=this.closest('.product-card');


const product={


name:
card.querySelector('.product-card-name').textContent,


price:
card.querySelector('.product-card-price').textContent,


image:
card.querySelector('img').src


};



wishlist.push(product);


saveWishlist();



alert(
product.name + ' saved to wishlist'
);



});


});
// ============================================
// DISPLAY CART ITEMS
// ============================================


const cartItemsList = document.getElementById('cartItemsList');
const cartEmpty = document.getElementById('cartEmpty');


if(cartItemsList){


if(cart.length === 0){


if(cartEmpty){

cartEmpty.style.display = 'block';

}


}else{


if(cartEmpty){

cartEmpty.style.display = 'none';

}



cart.forEach((item,index)=>{


const cartItem = document.createElement('div');


cartItem.className = 'cart-item';



cartItem.innerHTML = `


<div class="cart-product">


<img src="${item.image}" alt="${item.name}">


<div>

<h3>${item.name}</h3>

</div>


</div>



<div>

${item.price}

</div>



<div>

1

</div>



<div>


${item.price}



<button class="remove-cart" data-index="${index}">

Remove

</button>



</div>



`;



cartItemsList.appendChild(cartItem);



});



}


}




// Remove from cart


document.querySelectorAll('.remove-cart').forEach(button=>{


button.addEventListener('click',function(){


const index=this.dataset.index;



cart.splice(index,1);



saveCart();



location.reload();



});


});





// ============================================
// CART SUMMARY
// ============================================


const subtotal =
document.getElementById('summarySubtotal');


const total =
document.getElementById('summaryTotal');



if(subtotal && total){


let amount = 0;


cart.forEach(item=>{


amount += Number(
item.price.replace(/[^0-9]/g,'')
);


});



subtotal.textContent =
'$' + amount.toLocaleString();



total.textContent =
'$' + amount.toLocaleString();



}




// ============================================
// CLEAR CART
// ============================================


const clearCartBtn =
document.getElementById('clearCartBtn');


if(clearCartBtn){


clearCartBtn.addEventListener('click',()=>{


cart=[];


saveCart();


location.reload();


});


}




// ============================================
// DISPLAY WISHLIST ITEMS
// ============================================


const wishlistGrid =
document.getElementById('wishlistGrid');


const wishlistEmpty =
document.getElementById('wishlistEmpty');



if(wishlistGrid){



if(wishlist.length === 0){


if(wishlistEmpty){

wishlistEmpty.style.display='block';

}



}else{



if(wishlistEmpty){

wishlistEmpty.style.display='none';

}




wishlist.forEach((item,index)=>{



const wishItem =
document.createElement('div');



wishItem.className =
'product-card';



wishItem.innerHTML = `



<div class="product-card-image">


<img src="${item.image}" alt="${item.name}">


</div>



<div class="product-card-info">


<h3 class="product-card-name">

${item.name}

</h3>



<p class="product-card-price">

${item.price}

</p>



<button class="remove-wishlist"
data-index="${index}">

Remove

</button>


</div>



`;



wishlistGrid.appendChild(wishItem);



});



}



}




// Remove wishlist item


document.querySelectorAll('.remove-wishlist')
.forEach(button=>{


button.addEventListener('click',function(){


const index=this.dataset.index;



wishlist.splice(index,1);



saveWishlist();



location.reload();



});


});





// ============================================
// CLEAR WISHLIST
// ============================================


const clearWishlistBtn =
document.getElementById('clearWishlistBtn');



if(clearWishlistBtn){


clearWishlistBtn.addEventListener('click',()=>{


wishlist=[];


saveWishlist();


location.reload();


});


}






// ============================================
// API CONNECTION
// ============================================


const API_BASE = 
'https://coco-cartel-backend.onrender.com/api';





// ============================================
// PASSWORD CHANGE
// ============================================


const passwordForm =
document.getElementById('passwordForm');



if(passwordForm){


passwordForm.addEventListener(
'submit',
async function(e){


e.preventDefault();



const currentPassword =
document.getElementById('currentPassword').value;


const newPassword =
document.getElementById('newPassword').value;


const confirmPassword =
document.getElementById('confirmPassword').value;




if(newPassword !== confirmPassword){


alert('New passwords do not match.');

return;


}




if(newPassword.length < 6){


alert('Password must be at least 6 characters.');

return;


}




try{


const token =
localStorage.getItem('cocoToken');



const res =
await fetch(
`${API_BASE}/auth/change-password`,
{


method:'POST',


headers:{


'Content-Type':'application/json',


'Authorization':
`Bearer ${token}`


},


body:JSON.stringify({

currentPassword,

newPassword

})


});


const data =
await res.json();



if(data.success){


alert(
'Password updated successfully.'
);


passwordForm.reset();


}else{


alert(
data.message ||
'Failed to update password.'
);


}




}catch(error){


alert(
'Connection error. Please try again.'
);


}




});



}



});