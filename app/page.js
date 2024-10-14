"use client";
import { useState } from "react";
import Link from "next/link";
import { categories } from "@/public/data";
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
    <div>
      {/* Header */}
      <header className="flex justify-between p-4 bg-gray-800 text-white">
        <div className="logo">Logo</div>
        <div className="flex items-center">
         
          <div className="cart">
            <button className="flex items-center">
              <span className="mr-2">Cart</span>
              <span className="bg-red-500 px-2 py-1 rounded-full">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="p-4">
        {categories.map((category) => (
          <div key={category.title} className="mb-6">
            <div
              className="flex justify-between cursor-pointer border-b pb-2 mb-2"
              onClick={() => toggleCategory(category.title)}
            >
              <div className="text-xl">{category.title}</div>
              <img src={category.image} alt={category.title} className="w-16 h-16 object-cover" />
            </div>

            {/* Dishes under each category */}
            {categoryOpen[category.title] && (
              <div className="ml-4">
                {category.dishes.map((dish) => (
                  <div key={dish.name} className="flex justify-between items-center mb-4">
                    {/* Add/remove button */}
                    <div className="flex items-center">
                      <button
                        className="px-2 bg-gray-300"
                        onClick={() => removeFromCart(dish.name)}
                      >
                        -
                      </button>
                      <span className="px-4">{cartItems[dish.name] || 0}</span>
                      <button
                        className="px-2 bg-gray-300"
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
      <footer className="p-4">
        <Link href={`/checkout?${serializeCartItems()}`} className="block bg-green-500 text-white text-center py-2 rounded">
          Checkout
        </Link>
      </footer>
    </div>
  );
}
