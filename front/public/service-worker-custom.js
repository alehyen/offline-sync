self.importScripts('./idb.js');
var apiHost = '388a7336.ngrok.io'

const dbPromise = idb.open('users-data', 1, upgradeDB => {
	upgradeDB.createObjectStore('users', { keypath: 'id' });
});
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open('offline-sync').then(cache => {
			return cache.addAll([
				`/static`,
				`/static/css/*`,
				`/static/js/*`,
				`/idb.js`,])
		})
	);
});


self.addEventListener('activate', event => {
	event.waitUntil(
		createUsersDB()
	);
});


self.addEventListener('fetch', event => {
	let requestURL = new URL(event.request.url);
	if (requestURL.hostname === apiHost) {
		event.respondWith(serverApiResponse(event.request))
	}
	else {
		event.respondWith(
			caches.match(event.request, {
				ignoreVary: true
			})
				.then(response => {
					return response || fetch(event.request);
				})
		);
	}
});

function serverApiResponse(request) {
	if (request.headers.get('x-use-cache-only')) {
		console.log('using cache users data')
		return caches.match(request);
	}
	else {
		console.log('using live users data')
		return fetch(request).then(response => {
			let resClone = response.clone()
			caches.open('users-data').then(cache => {
				cache.put(request, resClone)
				console.log('user data is cached')
			})
			return response;
		})

	}
}

self.addEventListener('sync', event => {
	if (event.tag == 'edit-user') {
		console.log('syncing will start in 10s')
		event.waitUntil(
			setTimeout(() => {
				getUsersToEdit().then(users => {
					users.forEach(user => {
						console.log('posting user ' + user.id)
						fetch('https://' + apiHost, {
							method: 'PUT',
							mode: "no-cors",
							body: JSON.stringify(user),
							headers: { 'Content-Type': 'application/json' }
						}).then(response => {
							// Success! Remove them from the outbox
							removeUser(user.id);
						}).catch(error => {
							console.log('something went wrong')
							console.log(error)
						})
					})


				}).then(() => {
					// Tell pages of your success so they can update UI
					return clients.matchAll({ includeUncontrolled: true });
				}).then(clients => {
					clients.forEach(client => client.postMessage('outbox-processed'))
				})
			}, 13000)
		);
	}
});

function createUsersDB() {
	console.log('creating users DB')
	if ('indexedDB' in navigator) {
		idb.open('users-data', 1, upgradeDB => {
			let store = upgradeDB.createObjectStore('users', { keypath: 'id' })
		})
	}
}

function getUsersToEdit() {
	console.log('getting users to edit')
	return dbPromise.then(db => {
		return db.transaction('users').objectStore('users').getAll()
	})
}

function removeUser(id) {
	console.log('user removed :' + id)
	return dbPromise.then(db => {
		const tx = db.transaction('users', 'readwrite');
		tx.objectStore('users').delete(id);
		return tx.complete;
	})
}


