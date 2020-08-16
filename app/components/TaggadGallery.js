import React from 'react';
import * as taggad from "../utils/taggad.js";


const img_stations = ["start", "1", "goal"]
const video_stations = ["1"]

class TaggadGallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runner: "", // search bar
            times: [null, null, null]
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
        taggad.get_times(this.state.runner, img_stations).then(times => {
            console.log("got matches", times);
            if(!times) return;
            this.setState({times: times});
        });
    }

    render() {
        return (
            <div className="taggad-gallery">
                <form onSubmit={this.handleSubmit} className="search-bar">
                    <input className="input" type="text" placeholder="enter number tag..." value={this.state.runner} onChange={this.handleChange} />
                    <input className="button" type="submit" value="search"/>
                </form>
                <div className="carousels">
                    <div className="carousels-title">
                        <h3> Images </h3>
                    </div>
                    <Carousel station="start" n={this.props.n} time={this.state.times[0]}/>
                    <Carousel station="1" n={this.props.n} time={this.state.times[1]}/>
                    <Carousel station="goal" n={this.props.n} time={this.state.times[2]}/>
                </div>
                <div className="youtube-links">
                    <div className="youtube-links-title">
                        <h3> Stream </h3>
                    </div>
                    <YoutubeLink station="1" time={this.state.times[1]} offset={7154}/>
                </div>
            </div>
        );
    }
}

class Carousel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curr: null, // current img doc
            match: null,
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
        taggad.get_latest(this.props.station, latest => {
            console.log("latest:", latest)
            this.setState({curr: latest}, this.updateImgs);
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.time !== prevProps.time) {
            taggad.get_match(this.props.station, this.props.time).then(match => {
                console.log("match:", match);
                this.setState({curr: match, match: match}, this.updateImgs);
            });
        }
    }

    updateImgs() {
        console.log("updating with", this.props.station, this.state.curr, this.props.n);
        if (this.state.curr==null) return;
        taggad.set_older_listener(this.props.station, this.state.curr, this.props.n, res => {
            console.log("got older", res.docs.map(doc => doc.data()));
            this.setState({older: res.docs});
        })
        taggad.set_newer_listener(this.props.station, this.state.curr, this.props.n, res => {
            console.log("got newer", res);
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
           <div className="carousel">
                <h4> Station {this.props.station} </h4>
                <div className="wrapper-images">
                    <div className="newer-images adjacent"> 
                        {this.state.newer.map((img, i) => (
                            <figure key={i} className={"newer-fig newer"+i + " " + (this.props.match && this.props.match.id===img.id ? "match" : "normal")}>
                                <img src={img.data()["img"]} alt={"img_"+i}/>
                            </figure>
                        ))}
                    </div>
                    <div className="curr-and-buttons">
                        <button className="button newer-button" onClick={this.onNewer}> newer </button>
                        <figure className={"curr-fig " + (this.props.match && this.props.match.id===this.curr.id ? "match" : "normal")}>
                            <img src={this.state.curr ? this.state.curr.data()["img"] : "../public/logo.png"} alt={"img_curr"}/>
                        </figure>
                        <button className="button older-button" onClick={this.onOlder}> older </button>
                    </div>
                    <div className="older-images adjacent"> 
                        {this.state.older.map((img, i) => (
                            <figure key={i} className={"older-fig older"+i + " " + (this.props.match && this.props.match.id===img.id ? "match" : "normal")}>
                                <img src={img.data()["img"]} alt={"img_"+i}/>
                            </figure>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
class YoutubeLink extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="youtube-link">
                <p> <a href="https://www.youtube.com/">youtube/station_{this.props.station}/at_time_{this.props.time}</a> </p>
            </div>
        )
    }
}


export default TaggadGallery;
//                            <figcaption> {img.time.getHours()}:{img.time.getMinutes()}:{img.time.getSeconds()} </figcaption>
