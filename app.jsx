class Modal extends React.Component {
    render() {
        const { isOpen, onClose, attraction } = this.props;
        if (!isOpen) return null;

        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h2>{attraction.name}</h2>
                    <p>{attraction.description}</p>
                    {attraction.photosURLs && attraction.photosURLs.length > 0 && (
                        <img src={attraction.photosURLs[0]} alt={`${attraction.name} photo`} />
                    )}
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }
}

class AttractionTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sortDirection: 'asc',
            sortKey: null,
        };
    }

    handleSort = (key) => {
        const { sortDirection, sortKey } = this.state;
        const newDirection = (sortKey === key && sortDirection === 'asc') ? 'desc' : 'asc';

        const sortedAttractions = [...this.props.attractions].sort((a, b) => {
            if (a[key] < b[key]) return newDirection === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return newDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.setState({
            sortDirection: newDirection,
            sortKey: key,
        });

        this.props.onSort(sortedAttractions);
    };

    render() {
        const { attractions, onAttractionClick } = this.props;
        const { sortDirection, sortKey } = this.state;

        return (
            <table border="1">
                <thead>
                    <tr>
                        <th onClick={() => this.handleSort('name')}>
                            Name {sortKey === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => this.handleSort('address')}>
                            Address {sortKey === 'address' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => this.handleSort('phoneNumber')}>
                            Phone Number {sortKey === 'phoneNumber' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => this.handleSort('rating')}>
                            Rating {sortKey === 'rating' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {attractions.map((attraction, index) => (
                        <tr key={index} onClick={() => onAttractionClick(attraction)}>
                            <td>{attraction.name}</td>
                            <td>{attraction.address}</td>
                            <td>{attraction.phoneNumber}</td>
                            <td>{attraction.rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

class SearchBar extends React.Component {
    render() {
        const { searchQuery, onSearchChange } = this.props;
        return (
            <input
                type="text"
                placeholder="Search attractions..."
                value={searchQuery}
                onChange={onSearchChange}
                style={{ marginLeft: '10px' }}
            />
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            attractions: [],
            filteredAttractions: [],
            showFreeOnly: false,
            selectedAttraction: null,
            searchQuery: '',
            isTopModalOpen: false, // Tracks the new modal state
        };
    }

    // Method to toggle the new modal
    toggleTopModal = () => {
        this.setState(prevState => ({ isTopModalOpen: !prevState.isTopModalOpen }));
    };

    componentDidMount() {
        fetch('dublin_attractions.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const updatedAttractions = data.map(attraction => ({
                    ...attraction,
                    free: attraction.description.toLowerCase().includes("free") ? "yes" : "no"
                }));

                console.log("Updated Attractions:", updatedAttractions);
                this.setState({ attractions: updatedAttractions, filteredAttractions: updatedAttractions });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    toggleFreeOnly = () => {
        this.setState(prevState => {
            const showFreeOnly = !prevState.showFreeOnly;
            return {
                showFreeOnly,
                filteredAttractions: this.filterAttractions(this.state.searchQuery, showFreeOnly)
            };
        });
    }

    handleAttractionClick = (attraction) => {
        this.setState({ selectedAttraction: attraction });
    }

    closeModal = () => {
        this.setState({ selectedAttraction: null });
    }

    handleSort = (sortedAttractions) => {
        this.setState({ filteredAttractions: sortedAttractions });
    }

    handleSearchChange = (event) => {
        const searchQuery = event.target.value;
        this.setState({
            searchQuery,
            filteredAttractions: this.filterAttractions(searchQuery, this.state.showFreeOnly)
        });
    }

    filterAttractions = (searchQuery, showFreeOnly) => {
        return this.state.attractions.filter(attraction => {
            const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFree = !showFreeOnly || attraction.free === "yes";
            return matchesSearch && matchesFree;
        });
    }

    resetFilter = () => {
        this.setState(prevState => ({
            showFreeOnly: false,
            searchQuery: '',
            filteredAttractions: prevState.attractions,
        }));
    }

    render() {
        return (
            <div>
                <h1>Dublin Attractions</h1>


                <label>
                    <input
                        type="checkbox"
                        checked={this.state.showFreeOnly}
                        onChange={this.toggleFreeOnly}
                    />
                    Free
                </label>

                <SearchBar
                    searchQuery={this.state.searchQuery}
                    onSearchChange={this.handleSearchChange}
                />

                <button onClick={this.resetFilter} style={{ marginLeft: '10px' }}>Show All Attractions</button>

                <AttractionTable
                    attractions={this.state.filteredAttractions}
                    onAttractionClick={this.handleAttractionClick}
                    onSort={this.handleSort}
                />

                <Modal
                    isOpen={!!this.state.selectedAttraction}
                    onClose={this.closeModal}
                    attraction={this.state.selectedAttraction}
                />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));