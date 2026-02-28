// 1. Create the Navbar Container
const navbar = document.createElement('nav');
navbar.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #2c3e50;
    color: white;
    font-family: sans-serif;
`;

// 2. Create Home Icon
const homeIcon = document.createElement('div');
homeIcon.innerHTML = '🏠';
homeIcon.style.cursor = 'pointer';
homeIcon.style.fontSize = '24px';
homeIcon.onclick = () => window.location.reload();

// 3. Create Search Group
const searchGroup = document.createElement('div');
searchGroup.style.display = 'flex';
searchGroup.style.flex = '1';
searchGroup.style.margin = '0 20px';

const input = document.createElement('input');
input.placeholder = 'Search topics...';
input.style.cssText = 'width: 100%; padding: 10px; border: none; border-radius: 4px 0 0 4px; outline: none;';

const searchBtn = document.createElement('button');
searchBtn.innerText = 'Search';
searchBtn.style.cssText = 'padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer;';
searchBtn.onclick = () => alert('Searching for: ' + input.value);

searchGroup.append(input, searchBtn);

// 4. Create Filter Dropdown
const filterContainer = document.createElement('div');
filterContainer.style.position = 'relative';

const filterBtn = document.createElement('button');
filterBtn.innerHTML = 'Filters ▾';
filterBtn.style.cssText = 'padding: 10px 15px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;';

const dropdownMenu = document.createElement('div');
dropdownMenu.style.cssText = `
    display: none;
    position: absolute;
    right: 0;
    top: 45px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-radius: 4px;
    min-width: 150px;
    overflow: hidden;
`;

// Track selected filters
const selectedFilters = new Set();

// Add items to dropdown
['Popular', 'Tickets', 'Clothes', 'Tech', 'New', 'Used'].forEach(text => {
    const item = document.createElement('div');
    item.innerText = text;
    item.style.cssText = 'padding: 12px; color: #333; cursor: pointer; border-bottom: 1px solid #eee;';
    
    item.onmouseover = () => {
        if (!selectedFilters.has(text)) item.style.background = '#f1f1f1';
    };
    item.onmouseout = () => {
        item.style.background = selectedFilters.has(text) ? '#3498db' : 'white';
        item.style.color = selectedFilters.has(text) ? 'white' : '#333';
    };
    item.onclick = (e) => {
        e.stopPropagation();
        if (selectedFilters.has(text)) {
            selectedFilters.delete(text);
            item.style.background = '#f1f1f1';
            item.style.color = '#333';
        } else {
            selectedFilters.add(text);
            item.style.background = '#3498db';
            item.style.color = 'white';
        }
        filterBtn.innerHTML = selectedFilters.size > 0 ? `Filters (${selectedFilters.size}) ▾` : 'Filters ▾';
    };
    dropdownMenu.appendChild(item);
});

// Toggle Logic
filterBtn.onclick = (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
};

// Close dropdown when clicking outside
window.onclick = () => dropdownMenu.style.display = 'none';

filterContainer.append(filterBtn, dropdownMenu);

// 5. Assemble and Inject
navbar.append(homeIcon, searchGroup, filterContainer);
document.body.prepend(navbar);
document.body.style.margin = '0';

// 6. Item Manager Section
const mainContainer = document.createElement('div');
mainContainer.style.padding = '20px';
mainContainer.style.fontFamily = 'sans-serif';

// Button to toggle form
const addItemBtn = document.createElement('button');
addItemBtn.innerText = 'Add New Item';
addItemBtn.style.cssText = 'padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px; font-size: 16px;';

// Form Container
const formContainer = document.createElement('div');
formContainer.style.cssText = 'margin-bottom: 20px; display: none; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; box-shadow: 0 2px 5px rgba(0,0,0,0.05);';

const descInput = document.createElement('input');
descInput.placeholder = 'Item Description';
descInput.style.cssText = 'padding: 10px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; width: 250px;';

const priceInput = document.createElement('input');
priceInput.placeholder = 'Price ($)';
priceInput.type = 'number';
priceInput.style.cssText = 'padding: 10px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100px;';

const submitItemBtn = document.createElement('button');
submitItemBtn.innerText = 'Save Item';
submitItemBtn.style.cssText = 'padding: 10px 20px; background: #2980b9; color: white; border: none; border-radius: 4px; cursor: pointer;';

formContainer.append(descInput, priceInput, submitItemBtn);

// List Container
const itemList = document.createElement('div');
itemList.style.display = 'grid';
itemList.style.gap = '15px';
itemList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';

// Toggle Form Logic
addItemBtn.onclick = () => {
    const isHidden = formContainer.style.display === 'none';
    formContainer.style.display = isHidden ? 'block' : 'none';
    addItemBtn.innerText = isHidden ? 'Close Form' : 'Add New Item';
    addItemBtn.style.background = isHidden ? '#c0392b' : '#27ae60';
};

// Add Item Logic
submitItemBtn.onclick = () => {
    const desc = descInput.value;
    const price = priceInput.value;

    if (desc && price) {
        const itemCard = document.createElement('div');
        itemCard.style.cssText = 'padding: 20px; background: white; border-left: 5px solid #27ae60; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; border-radius: 4px;';
        
        const itemText = document.createElement('span');
        itemText.innerText = desc;
        itemText.style.fontWeight = 'bold';
        itemText.style.color = '#2c3e50';
        itemText.style.fontSize = '16px';

        const itemPrice = document.createElement('span');
        itemPrice.innerText = `$${parseFloat(price).toFixed(2)}`;
        itemPrice.style.color = '#27ae60';
        itemPrice.style.fontWeight = 'bold';
        itemPrice.style.fontSize = '18px';

        itemCard.append(itemText, itemPrice);
        itemList.appendChild(itemCard);

        // Clear inputs
        descInput.value = '';
        priceInput.value = '';
    } else {
        alert('Please enter both description and price.');
    }
};

mainContainer.append(addItemBtn, formContainer, itemList);
document.body.appendChild(mainContainer);