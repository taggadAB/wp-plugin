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

export function get_latest(station) {
	return db.collection("station_"+station).orderBy("time", "desc").limit(1).get().then(res => {
		if(res.docs.length) {
			console.log("latest got:", res.docs[0].id);
			return res.docs[0];
		} else {
			console.log("latest not found");
		}
	}).catch(error => { console.log("found db error: ", error) });
}

export function get_matches(runner, stations) {

	return fetch("http://api.eqtiming.com/api/Easy/Result/Contestant/49571?bib="+runner).then(doc => {
		console.log(doc); 
		return doc["DeltakerList"].map(station => Date(station["FinishTime"]))
	}).then(times => {
		let matches = [null, null, null];
		if (times.length) {
			let after = db.collection("station_start").orderBy("time", "desc").startAt(times[0]).limit(1).get();
			let before = db.collection("station_start").orderBy("time", "asc").startAt(times[0]).limit(1).get();

			if (Math.abs(after.data()["time"].toDate() - times[0]) < Math.abs(before.data()["time"].toDate() - times[0])) {
				matches[0] = after;
			} else {
				matches[0] = before;
			}
		}
		if (times.length > 1) {
			let after = db.collection("station_1").orderBy("time", "desc").startAt(times[1]).limit(1).get();
			let before = db.collection("station_1").orderBy("time", "asc").startAt(times[1]).limit(1).get();

			if (Math.abs(after.data()["time"].toDate() - times[0]) < Math.abs(before.data()["time"].toDate() - times[0])) {
				matches[0] = after;
			} else {
				matches[0] = before;
			}
		}
		if (times.length > 2) {
			let after = db.collection("station_goal").orderBy("time", "desc").startAt(times[2]).limit(1).get();
			let before = db.collection("station_goal").orderBy("time", "asc").startAt(times[2]).limit(1).get();

			if (Math.abs(after.data()["time"].toDate() - times[0]) < Math.abs(before.data()["time"].toDate() - times[0])) {
				matches[0] = after;
			} else {
				matches[0] = before;
			}
		}
		return matches;
	})
	
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
const listeners = {}

export function set_older_listener(station, curr, n, callback) {
	if (listeners["older"+station] != null) {
		console.log("cancelling older listener")
		listeners["older"+station]()
	}
	listeners["older"+station] = db.collection("station_"+station).orderBy("time", "desc").startAfter(curr).limit(n).onSnapshot(callback)
}
export function set_newer_listener(station, curr, n, callback) {
	if (listeners["newer"+station] != null) {
		console.log("cancelling newer listener")
		listeners["newer"+station]()
	}
	listeners["newer"+station] = db.collection("station_"+station).orderBy("time", "asc").startAfter(curr).limit(n).onSnapshot(callback)
	
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