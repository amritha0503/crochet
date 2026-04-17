import { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  total_items: 0,
  total_price: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      let newItems = [...state.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
          subtotal: (newItems[existingItemIndex].quantity + 1) * action.payload.price
        };
      } else {
        newItems.push({
          ...action.payload,
          quantity: 1,
          subtotal: parseInt(action.payload.price.replace('₹', ''))
        });
      }

      return {
        ...state,
        items: newItems,
        total_items: state.total_items + 1,
        total_price: newItems.reduce((acc, item) => acc + item.subtotal, 0)
      };
    }
    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;
      
      const newItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: newItems,
        total_items: state.total_items - itemToRemove.quantity,
        total_price: newItems.reduce((acc, item) => acc + item.subtotal, 0)
      };
    }
    case 'UPDATE_QTY': {
      const { id, quantity } = action.payload;
      if (quantity < 1) return state;
      
      const newItems = state.items.map(item => {
        if (item.id === id) {
          const price = parseInt(item.price.replace('₹', ''));
          return { ...item, quantity, subtotal: price * quantity };
        }
        return item;
      });

      const total_items = newItems.reduce((acc, item) => acc + item.quantity, 0);
      const total_price = newItems.reduce((acc, item) => acc + item.subtotal, 0);

      return { ...state, items: newItems, total_items, total_price };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
