import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import '../App.css';

import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    input: {
        margin: theme.spacing.unit,
    },
});

class Userdetails extends Component {
    constructor(props){
        super(props);
        this.state = {value1: '',
                      value2: '',
                      value3: ''                  
                     };
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleChange3 = this.handleChange3.bind(this);
        this.userInfo = {}
    }

    componentDidMount() {
        this.sendUserInfoToParent(); //清空userInfo;
    }
    handleChange1(e){
        this.setState({value1: e.target.value});
        if(e.target.value.length === 0){
            document.getElementById('1').style.border = '1px solid #ff8400';
        }else{
            document.getElementById('1').style.border = 'none';
        }       
        this.userInfo.firstName = e.target.value
        this.sendUserInfoToParent(this.userInfo)
    }

    handleChange2(e){
        this.setState({value2: e.target.value});
        if(e.target.value.length === 0){
            document.getElementById('2').style.border = '1px solid #ff8400';
        }else{
            document.getElementById('2').style.border = 'none';
        }  
        this.userInfo.lastName = e.target.value
        this.sendUserInfoToParent(this.userInfo)     
    }
    handleChange3(e){
        this.setState({value3: e.target.value});
        let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{1,4})$/;
        if(!reg.test(e.target.value)){
            document.getElementById('3').style.border = '1px solid #ff8400';
        }else{
            document.getElementById('3').style.border = 'none';
        }
        this.userInfo.email = e.target.value
        this.sendUserInfoToParent(this.userInfo) 
    }

    sendUserInfoToParent(userInfo = {}) {
      this.props.getUserInfo('userInfo', userInfo)
    }
 
   
    render(){
        const { classes } = this.props;
        var detailWidth = {
                width:'100%',
                backgroundColor: "#f4f4f4"
            }
        let value1 = this.state.value1;
        let value2 = this.state.value2;
        let value3 = this.state.value3;
        return (
            <div className={classes.container}>
            <div className='sectionHeader' style={detailWidth}>
                <FormattedMessage
                    id='userdetail'
                    defaultMessage='YOUR DETAILS'
                />
            </div>
            <Input
                placeholder="Passport First Name"
                className={classes.input}               
                style={detailWidth}
                id='1'
                value={value1}
                onChange={this.handleChange1}
                autoFocus={true}
                disableUnderline={true}
            />   
            <Input
                placeholder="Passport Last Name"
                className={classes.input}
                style={detailWidth}
                id='2'
                value={value2}
                onChange={this.handleChange2}
                disableUnderline={true}
            /> 
            <Input
                placeholder="Email Address to Receive Voucher"
                className={classes.input}
                inputProps={{
                    'aria-label': 'Description',
                }}
                style={detailWidth}
                id='3'
                value={value3}
                onChange={this.handleChange3}
                disableUnderline={true}
            />        
            </div>
        );
    }
   
}

Userdetails.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Userdetails);
