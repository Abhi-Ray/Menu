"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { categories } from "@/public/data";
import Footer from './footer'
export default function MenuPage() {
  // State for cart and categories
  const [cartCount, setCartCount] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState({});
  const [cartItems, setCartItems] = useState({});



  const toggleCategory = (category) => {
    setCategoryOpen((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  const addToCart = (dishName) => {
    setCartItems((prevItems) => {
      const newQuantity = (prevItems[dishName] || 0) + 1;
      setCartCount(cartCount + 1);
      return { ...prevItems, [dishName]: newQuantity };
    });
  };

  const removeFromCart = (dishName) => {
    setCartItems((prevItems) => {
      const newQuantity = (prevItems[dishName] || 1) - 1;
      setCartCount(cartCount > 0 ? cartCount - 1 : 0);
      return { ...prevItems, [dishName]: Math.max(newQuantity, 0) };
    });
  };

  const serializeCartItems = () => {
    return Object.entries(cartItems)
      .map(([dishName, quantity]) => {
        const dish = categories.flatMap(category => category.dishes).find(d => d.name === dishName);
        return `name=${encodeURIComponent(dishName)}&quantity=${quantity}&price=${dish.price}`;
      })
  };

 

  return (
    <>
    <div>
      {/* Header */}
      <header className="flex justify-between p-4 " style={{backgroundColor:"#f0eae5"}}>
        <div className="logo"><Image src="/img/logo.png" alt="logo" width={50} height={50}/></div>
        <div className="flex items-center">
         
          <div className="cart">
            <button className="flex items-center">
              <span className="mr-2"><i class="fa-solid fa-cart-shopping" style={{color:"#5a0005", fontSize:"1.05em"}}></i></span>
              <span  style={{color:"white", backgroundColor:"#5a0005",width:"20px" , height:"20px",borderRadius:"50%",fontSize:".8em"}}>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="p-4 mt-6">
        {categories.map((category) => (
          <div key={category.title} className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer  py-2 px-4 mb-2"
              onClick={() => toggleCategory(category.title)}
              style={{ backgroundColor: category.color , borderRadius:"40px"}}

            >
              <div className="text-xl">{category.title}</div>
              <img src={category.image} alt={category.title} className="w-16 h-16 object-cover" />
            </div>

            {/* Dishes under each category */}
            {categoryOpen[category.title] && (
              <div className="ml-4" style={{color:category.color}}>
                {category.dishes.map((dish) => (
                  <div key={dish.name} className="flex justify-between items-center mb-4">
                    {/* Add/remove button */}
                    <div className="flex items-center">
                      <button
                        className="px-2 bg-gray-100"
                        onClick={() => removeFromCart(dish.name)}
                      >
                        -
                      </button>
                      <span className="px-4">{cartItems[dish.name] || 0}</span>
                      <button
                        className="px-2 bg-gray-100"
                        onClick={() => addToCart(dish.name)}
                      >
                        +
                      </button>
                    </div>

                    {/* Dish name and price */}
                    <div className="text-center">
                      <div>{dish.name}</div>
                      <div className="text-gray-500">₹{dish.price}</div>
                    </div>

                    {/* Dish image */}
                    <img src={dish.image} alt={dish.name} className="w-16 h-16 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Checkout button */}
      <footer className="p-4 w-full mx-auto">
        <Link href={`/checkout?${serializeCartItems()}`} className="block bg-green-500 text-white text-center py-2 rounded">
          Checkout
        </Link>
      </footer>
    </div>
    <Footer/>
    </>
  );
}
