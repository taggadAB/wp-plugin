import React from 'react';
import * as taggad from "../utils/taggad.js"


const stations = [0, 1, 2]

class Carousels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runner: "", // search bar
            matches: [null, null, null]
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({runner: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        if(!this.state.runner) return;
        console.log('searching: ', this.state.runner);
        this.setState({runner: ""});
        taggad.get_matches(this.state.runner, stations).then(matches => {
            console.log("got matches", matches);
            if(!matches) return;
            this.setState({matches: matches});
        });
    }

    render() {
        return (
            <div className="carousels">
                <form onSubmit={this.handleSubmit} className="taggadSearchBar">
                    <input className="input" type="text" placeholder="enter number tag..." value={this.state.runner} onChange={this.handleChange} />
                    <input className="button" type="submit" value="search"/>
                </form>
                <Carousel station="start" n={this.props.n} match={this.state.matches[0]}/>
                <Carousel station="1" n={this.props.n} match={this.state.matches[1]}/>
                <Carousel station="goal" n={this.props.n} match={this.state.matches[2]}/>
            </div>
        );
    }
}

class Carousel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curr: null, // current img doc
            older: [], 
            newer: [], 
            runner: "", // search bar
        };
        this.updateImgs = this.updateImgs.bind(this);
        this.onNewer = this.onNewer.bind(this);
        this.onOlder = this.onOlder.bind(this);
        this.getImgs = this.getImgs.bind(this);
    }

    componentDidMount() {
        taggad.get_latest(this.props.station).then(latest => {
            console.log("latest:", latest)
            this.setState({curr: latest}, this.updateImgs);
        });
    }

    componentDidUpdate(prevProps) {
    if (this.props.match !== prevProps.match) {
        this.setState({curr: this.props.match}, this.updateImgs);
    }
}

    updateImgs() {
        console.log("updating with", this.props.station, this.state.curr, this.props.n);
        taggad.set_older_listener(this.props.station, this.state.curr, this.props.n, res => {
            console.log("got older", res.docs.map(doc => doc.data()));
            this.setState({older: res.docs});
        })
        taggad.set_newer_listener(this.props.station, this.state.curr, this.props.n, res => {
            console.log("got older", res);
            this.setState({newer: res.docs});
        })
    }

    getImgs() {
        if (this.state.curr != null) {
            return [].concat(this.state.newer.reverse(), this.state.curr, this.state.older)
        } else {
            return []
        }
    }

    onNewer() {
        console.log("newer", this.state.newer)
        if(this.state.newer.length && this.state.newer[0] != this.state.curr) {
            this.setState({curr: this.state.newer[0]}, this.updateImgs);
        } else {
            console.log("failed either", this.state.newer, "or", this.state.newer != this.state.curr)
        }
    }

    onOlder() {
        console.log("older", this.state.older)
        if(this.state.older.length && this.state.older[0] != this.state.curr) {
            this.setState({curr: this.state.older[0]}, this.updateImgs);
        } else {
            console.log("failed either", this.state.older, "or", this.state.older[0] != this.state.curr)
        }
    }

    render() {
        return (
           <div className="Carousel">
                <h4> Station {this.props.station} </h4>
                <div className="Row">
                    <button className="button-cta" onClick={this.onNewer}> newer </button>
                    {this.getImgs().map((img, i) => (
                        <figure key={i} className={this.props.match && this.props.match.id===img.id ? "match" : "normal"}>
                            <img src={img.data()["thumb"]} alt={"img_"+i}/>
                        </figure>
                    ))}
                    <button className="button-cta" onClick={this.onOlder}> older </button>
                </div>
            </div>
        );
    }
}

export default Carousels;
//                            <figcaption> {img.time.getHours()}:{img.time.getMinutes()}:{img.time.getSeconds()} </figcaption>
