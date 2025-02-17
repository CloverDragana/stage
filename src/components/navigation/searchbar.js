"use client";

import { useState } from "react";

const Search = () => {

    const [ value, setValue ] = useState("Search");
     
    const handleSearch = (event) => {
        const { target } = event;
        setValue(target.value);
        console.log(value);
    }

    return(
        <div className="mx-1 rounded-3xl w-full flex content-center justify-center text-gray-600">
            <input type={'search'} name={'search'} placeholder={value} onChange={handleSearch} className="w-full p-3 content-center rounded-full shadow-[inset_0px_0px_10px_4px_rgba(217,_217,_217,_1)] focus:outline-none"/>
            <button type="submit" className=" mt-3 mr-4"> </button>
        </div>
    );
};

export default Search;