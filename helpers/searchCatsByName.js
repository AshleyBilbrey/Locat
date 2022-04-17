const searchCatsByName = (cats, searchTerm) => {
    const result = []
    cats.forEach(cat => {
        const catName = cat.name.toLowerCase();
        if(catName.includes(searchTerm.toLowerCase())) {
            result.push(cat);
        }
    });
    return result;
}

export default searchCatsByName