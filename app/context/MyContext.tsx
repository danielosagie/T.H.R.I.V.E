   // context/MyContext.tsx
   "use client";
   
   import React, { createContext, useContext, ReactNode, useState } from 'react';

   // Define the shape of your context value
   interface MyContextType {
     value: string;
     setValue: (value: string) => void;
   }

   // Create a context with a default value
   const MyContext = createContext<MyContextType | null>(null);

   // Create a provider component
   export const MyContextProvider = ({ children }: { children: ReactNode }) => {
     const [value, setValue] = useState('default value');

     const contextValue: MyContextType = {
       value,
       setValue,
     };

     return (
       <MyContext.Provider value={contextValue}>
         {children}
       </MyContext.Provider>
     );
   };

   // Create a custom hook to use the context
   export const useMyContext = () => {
     const context = useContext(MyContext);
     if (context === null) {
       throw new Error('useMyContext must be used within a MyContextProvider');
     }
     return context;
   };
