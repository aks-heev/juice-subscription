import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'juice_cart';

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage:', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (juice, quantity = 1) => {
        setItems(prevItems => {
            const existingIndex = prevItems.findIndex(item => item.id === juice.id);
            
            if (existingIndex >= 0) {
                // Update quantity if item exists
                const newItems = [...prevItems];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + quantity
                };
                return newItems;
            } else {
                // Add new item
                return [...prevItems, {
                    id: juice.id,
                    name: juice.name,
                    price: juice.price,
                    image_url: juice.image_url,
                    quantity
                }];
            }
        });
    };

    const removeItem = (juiceId) => {
        setItems(prevItems => prevItems.filter(item => item.id !== juiceId));
    };

    const updateQuantity = (juiceId, quantity) => {
        if (quantity <= 0) {
            removeItem(juiceId);
            return;
        }

        setItems(prevItems => 
            prevItems.map(item => 
                item.id === juiceId 
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const incrementItem = (juiceId) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === juiceId 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrementItem = (juiceId) => {
        setItems(prevItems => {
            const item = prevItems.find(i => i.id === juiceId);
            if (item && item.quantity <= 1) {
                return prevItems.filter(i => i.id !== juiceId);
            }
            return prevItems.map(i => 
                i.id === juiceId 
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            );
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemQuantity = (juiceId) => {
        const item = items.find(i => i.id === juiceId);
        return item ? item.quantity : 0;
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const value = {
        items,
        totalItems,
        totalPrice,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        incrementItem,
        decrementItem,
        clearCart,
        getItemQuantity,
        openCart,
        closeCart,
        toggleCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
