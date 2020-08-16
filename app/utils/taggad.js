import firebase from 'firebase';

firebase.initializeApp({
  apiKey: 'AIzaSyDP9z52rLlWI6sg9vmSKuG5JYWLaf1O5gU',
  authDomain: "taggad-4f62f.firebaseapp.com",
  databaseURL: "https://taggad-4f62f.firebaseio.com",
  projectId: "taggad-4f62f",
  storageBucket: "taggad-4f62f.appspot.com",
});

const store = firebase.storage();

const db = firebase.firestore().doc("timed_events/otillo_app");

const latest_listeners = {}
export function get_latest(station, callback) {
	if (latest_listeners[station] != null) {
		console.log("cancelling latest listener")
		latest_listeners[station]()
	}
	latest_listeners[station] = db.collection("station_"+station).orderBy("time", "desc").limit(1).onSnapshot(res => {
		if(res.docs.length) {
			console.log("latest at ", station, "got:", res.docs[0].id);
			callback(res.docs[0]);
			latest_listeners[station]()
		} else {
			console.log("latest not found");
		}
	}, error => { console.log("found latest error: ", error) });
}

export function get_times(runner) {
	return fetch("http://api.eqtiming.com/api/Easy/Result/Contestant/49571?bib="+runner, {mode: 'cors'}).then(doc => {
		console.log(doc); 
		return doc["DeltakerList"].map(station => Date(station["FinishTime"]))
	});
}

export function get_match(station, time) {
	let after = db.collection("station_"+station).orderBy("time", "desc").startAt(time).limit(1).get();
	let before = db.collection("station_"+station).orderBy("time", "asc").startAt(time).limit(1).get();
	if (Math.abs(after.data()["time"].toDate() - time) < Math.abs(before.data()["time"].toDate() - time)) {
		return after;
	} else {
		return before;
	}
}

// async function get_adjacent(station, curr, n) {
// 	let older = await db.collection("imgs_"+station).orderBy("time", "desc").startAt(curr).limit(n+1).get().then(res => res.docs);
// 	let newer = await db.collection("imgs_"+station).orderBy("time", "asc").startAfter(curr).limit(n).get().then(res => res.docs);
// 	let adjacent = newer.reverse().concat(older);
// 	console.log("older got:", older);
// 	console.log("newer got:", newer);
// 	console.log("adjacent got:", adjacent);
// 	return {adjacent: adjacent, older: older[1], newer: newer[0]};
// }

// export function get_adjacent_imgs(station, curr, n) {
// 	return get_adjacent(station, curr, n).then(docs => {
// 		return Promise.all(docs.adjacent.map(doc => get_img(doc))).then(imgs => {
// 			return {imgs: imgs, older: docs.older, newer: docs.newer};
// 		});
// 	});
// }
const older_listeners = {}
export function set_older_listener(station, curr, n, callback) {
	if (older_listeners[station] != null) {
		console.log("cancelling older listener")
		older_listeners[station]()
	}
	older_listeners[station] = db.collection("station_"+station).orderBy("time", "desc").startAfter(curr).limit(n).onSnapshot(callback, 
		error => { console.log("found older error: ", error) })
}

const newer_listeners = {}
export function set_newer_listener(station, curr, n, callback) {
	if (newer_listeners[station] != null) {
		console.log("cancelling newer listener")
		newer_listeners[station]()
	}
	newer_listeners[station] = db.collection("station_"+station).orderBy("time", "asc").startAfter(curr).limit(n).onSnapshot(callback, 
		error => { console.log("found newer error: ", error) })
	
}



// async function get_img(doc) {
// 	console.log("getting img:", doc.id);
// 	let src = await store.ref(doc.data()["img"]).getDownloadURL();
// 	let thumb = await store.ref(doc.data()["thumbnail"]).getDownloadURL();
// 	return {doc: doc,
// 		time: doc.data()["time"].toDate(),
// 	    src: src,
// 	    thumbnail: thumb};
// }

// export function get_runner_times(station) {
// 	return db.collection("runners").orderBy("time_"+station, "desc").get().then(res => {
// 		if(res.docs.length) {
// 			console.log("runners got:", res.docs.map(doc => doc.id));
// 			return res.docs.map(doc => {
// 				return {id: doc.id, time: doc.data()["time_"+station].toDate()};
// 			});
// 		} else {
// 			console.log("runners not found");
// 		}
// 	}).catch(error => { console.log("found db error: ", error) });
// }

// export function get_latest_urls(station) {
// 	db.collection("imgs_"+station).orderBy("time").limit(2*n+1).get().then(res => {
// 		let promises = res.docs.map(doc => {
// 			console.log("got blob", doc.data()["im"])
// 			return this.get_im(doc.data())
// 		});
// 		return Promise.all(promises);
// 	});
// }

// async get_im(doc) {
//     console.log("getting im:", doc.path);
//     let thumb = await store.ref(doc["thumbnail"]).getDownloadURL();
//     let src = await store.ref(doc["img"]).getDownloadURL();
//     return {name: doc["time"],
//         thumbnail: thumb,
//         src: src}
// } 

// export function get_imgs(station, match, n) {
// 	console.log('getting urls', station, match, n);
// 	let after = db.collection("imgs_"+station).orderBy("time").startAt(match).limit(n+1).get().then(res => {
//         let promises = res.docs.map(doc => {
// 			consloe.log("got blob", dot.data());
//         	return this.get_urls(doc.data().im);
//         });
//         return Promise.all(promises)
// 	}).catch(error => { console.log("found db error: ", error) });
// 	let after = db.collection("imgs_"+station).orderBy("time")
// 	return after
// }

// export function get_runner(runner) {
//     console.log('querying runner', runner); 
//     return db.collection("runners").doc(String(runner)).get().then(doc => {
// 		if (!doc.exists) {
//             console.log('No such document!'); 
//             return null;
//         } else {
// 	        console.log(doc.data());
// 	        return doc.data(); //stations.map(s => doc.data()["img_"+s])
// 	    }
//     }).catch(error => { console.log("found db error: ", error) });
// }