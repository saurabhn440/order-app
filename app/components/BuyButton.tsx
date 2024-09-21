import React, { useState } from 'react';
import styles from './BuyButton.module.css';

const BuyButton: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    // Add your buy logic here
    console.log('Buy button clicked!');
  };

  const ButtonText = () => (
    <>
      Buy Now <span className="price">₹{price}</span>
    </>
  );

  return (
    <button 
      className={`${styles.buyButton} ${isClicked ? styles.clicked : ''}`}
      onClick={handleClick}
    >
      {ButtonText()}
    </button>
  );
};

export default BuyButton;