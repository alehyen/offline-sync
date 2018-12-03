import React, { Component } from 'react';
import './UserCard.css';

class UserCard extends Component {

	render() {
		const user = this.props.user
		return(
			<div className="card">
				<div className="content">
					<img src={user.avatar} alt="Profile avatar" />
					<div className="info">
						<h3>
							{user.name}
						</h3>
						<p>{user.email}</p>
						<button className="edit-button" onClick={this.props.clickaction} >Edit</button>
					</div>
				</div>

			</div>
			)
		}
	}

	export default UserCard;