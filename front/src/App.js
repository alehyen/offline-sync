import React, { Component } from 'react';
import './App.css';
import UserCard from './components/user/UserCard';
import idb from 'idb';

const apiUrl = 'https://388a7336.ngrok.io'

class App extends Component {
  constructor() {
    super()
    this.state = {
      users: [],
      userToEdit: null,
    }
    this.changeName = this.changeName.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
    this.editUser = this.editUser.bind(this);

    navigator.serviceWorker.addEventListener('message', event => {
      this.getUserData().then(users =>{
        this.updatePageState(users)
      });
    });
  }
  componentDidMount() {
    
    if (navigator.onLine) {
      console.log('online')
      this.getUserData().then(users =>{
        this.updatePageState(users)
      })
    } else {
      console.log('offline')
      this.getCachedUserData().then(users =>{
        this.updatePageState(users)
      })
    }
    // this code is useful if you want to fetch from the cache first then go to the network
    // let showApiData = false;
    // let liveDataPromise = this.getUserData().then(users => {
    //   showApiData = true;
    //   this.updatePageState(users)
    // });

    // let cachedDataPromise = this.getCachedUserData().then(users => {
    //   if(!showApiData){
    //     this.updatePageState(users)
    //   }
    // });
    // // show alert only if api data and cache data fails to deliver
    // liveDataPromise.catch(() => {
    //   return cachedDataPromise
    // }).catch(() => {
    //   alert("No internet connection please retry again")
    // })

  }

  getUserData() {
    return fetch(apiUrl)
      .then(data => data.json())
      .catch(() => {
        console.log('fetch failed')
        return [];
      });
  }

  getCachedUserData() {
    return fetch(apiUrl, { headers: { 'x-use-cache-only': '1' } })
      .then(data => data.json())
      .catch(() => {
        return [];
      });
  }

  updatePageState(users) {
    this.setState({
      users: users,
      userToEdit: users[0],
    })
  }

  editUser() {
    if (navigator.onLine) {
      fetch(apiUrl, {
        method: 'POST',
        mode: "no-cors",
        body: JSON.stringify(this.state.userToEdit),
      })
        .then(response => {
          console.log(response)
          this.getUserData()
        })
    } else {
      this.storeUserData()
        .then(() => {
          console.log('user stored')
          return navigator.serviceWorker.ready;
        }).then(reg => {
          return reg.sync.register('edit-user');
        }).then(() => {
          console.log('Sync registered!');
        }).catch(() => {
          console.log('Sync registration failed :(');
        });
    }
  }

  storeUserData() {
    const dbPromise = idb.open('users-data', 1, upgradeDB => {
      upgradeDB.createObjectStore('users', { keypath: 'id' });
    });
    return dbPromise.then(db => {
      const tx = db.transaction('users', 'readwrite');
      tx.objectStore('users').put(this.state.userToEdit, this.state.userToEdit.id);
      return tx.complete
    })

  }

  handleClick(id) {
    this.setState({ userToEdit: this.state.users[id - 1] })
  }

  changeName(e) {
    this.setState({
      userToEdit:
      {
        id: this.state.userToEdit.id,
        email: this.state.userToEdit.email,
        name: e.target.value,
        avatar: this.state.userToEdit.avatar,
      }
    })
  }

  changeEmail(e) {
    this.setState({
      userToEdit:
      {
        id: this.state.userToEdit.id,
        email: e.target.value,
        name: this.state.userToEdit.name,
        avatar: this.state.userToEdit.avatar,
      }
    })
  }

  render() {
    const users = this.state.users
    let section;
    if (users.length > 0) {
      section = <div>
        <div className="users-list">
          {users.map(user =>
            <UserCard key={user.id} user={user} clickaction={() => this.handleClick(user.id)} />
          )}
          <div className="edit-form">
            <h3>Edit a user</h3>
            <form onSubmit={this.editUser}>
              <label>
                Name:
             <input type="text" value={this.state.userToEdit.name} onChange={this.changeName} />
              </label>
              <label>
                Email:
              <input type="text" value={this.state.userToEdit.email} onChange={this.changeEmail} />
              </label>
              <input type="submit" value="Submit" />
            </form>
          </div>
        </div>
      </div>

    }
    else {
      section = <h3> No users registered</h3>
    }
    return (
      <>
        {section}
      </>
    );
  }
}

export default App;
