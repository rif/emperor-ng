import * as React from "react";
import './App.css';

function App() {
    React.useEffect(() => {
        fetch("/adm/availablecommands")
            .then((response) => response.json())
            .then((json) => {
                console.log(JSON.stringify(json.items));
            });
        fetch("/adm/availablehosts")
            .then((response) => response.json())
            .then((json) => {
                console.log(JSON.stringify(json.items));
            });
    }, []);

    return (
            <div className="App">
            <header className="App-header">
            <p>Client</p>
            </header>
            </div>
    );
}

export default App;
