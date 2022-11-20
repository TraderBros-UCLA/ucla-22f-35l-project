import React from 'react';
import { Box } from '@mui/material';


class ModView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            modName: 'Persona 5: More Persona Slots', 
            author: 'sunny',
            desc: '',
            dateCreated: '2002/11/3',
            dateModified: '2022/11/18',
            url: 'http',
            gameName: 'Persona 5',
            tag: 'functional',
            views: '50',
            icon: 'https://www.gannett-cdn.com/presto/2020/04/02/PREN/1a3f1556-6174-4ed1-8881-4bbb8ab12f49-Cast.jpg'
        };
    }
    render(){
        return (
            <div style = {{
                    marginLeft: '10%',
                    marginRight: '10%',
                    marginTop: '20px',
                }}>
                <h1>Mod Name: {this.state.modName}</h1>
                <img className='modIcon' src={this.state.url} alt='mod icon'></img>
                <h2>Author: {this.state.author}</h2>
                <h3>Desc: {this.state.desc}</h3>
                <h4>Date Created: {this.state.dateCreated}</h4>
                <h5>Date Modified: {this.state.dateModified}</h5>
                <h6>Download URL: {this.state.url}</h6>
                <h7>Game: {this.state.gameName}     </h7>
                <h8>tag: {this.state.tag}      </h8>
                <h9>views: {this.state.views}     </h9>
            </div>
            
        );
        };
    }

export default ModView;