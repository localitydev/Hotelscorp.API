const title = React.createElement(
    'h1',
    { id: 'main-title', title: 'This is a title' },
    'My First React Element'
);

// What connects REACT to the DOM
ReactDOM.render(
    title,
    document.getElementById('room-component')
);


console.log(title);