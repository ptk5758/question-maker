import { useState } from "react";

export default function useInput() {
    const [value, setValue] = useState()
    
    return [value]
}