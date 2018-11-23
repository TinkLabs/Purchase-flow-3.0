import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import AlertDialog from './packageInclusion'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    },
});

class PackageRadio extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            
        };
        this.radioChange = this.radioChange.bind(this);
    }
  
    radioChange(event){
        // console.log(event.target.id);
        this.props.onChangePackage(event.target.id);
    }
    handleChange = event => {
        this.setState({ value: event.target.value });
    };
    
    render() {
        const { classes } = this.props;
        let packageList = [];
        let defaultTrue
        if(this.props.packages != undefined){
            packageList = this.props.packages
            // console.log(this.props.packages);
            for( let i=0; i<packageList.length; i++){
                //minimumPax 判断
                if(packageList[i].minimumPax > 1){
                    packageList[i].showExtral = true;
                }
                //dates 判断
                if(packageList[i].dates.length == 0){
                    
                     defaultTrue = packageList[i].dealItemTypes[0].prices.find(function(ele){
                        return ele.default = true;
                    })
                    for(let k=0; k<packageList[i].dealItemTypes[0].prices.length; k++){
                        if(defaultTrue.unitPrice > packageList[i].dealItemTypes[0].prices[k].unitPrice){
                            packageList[i].showExtral = true;
                        }
                    }
                }else{
                    for(let j=0; j<packageList[i].dates.length; j++){
                       
                        defaultTrue = packageList[i].dates[j].dealItemTypes[0].prices.find(function(ele){
                            return ele.default = true;
                        })
                        for(let m=0; m< packageList[i].dates[j].dealItemTypes[0].prices.length; m++){
                            if(defaultTrue.unitPrice > packageList[i].dates[j].dealItemTypes[0].prices[m].unitPrice){
                                packageList[i].showExtral = true;
                            }
                        }
                    }
                }
            }
            
            // console.log(defaultTrue);
        }
       
        return (
            <div>
                <div className='sectionHeader'>SELECT PACKAGES</div>
                <div className={classes.root} style={{ maxWidth: '100%' }}>
                    <FormControl component="fieldset" className={classes.formControl} id='packageForm'>
                        <RadioGroup
                            aria-label="gender"
                            name="gender2"
                            className={classes.group}
                            value={this.state.value}
                            onChange={this.handleChange}
                        >
                        {packageList.map((number) => (
                            <FormControlLabel
                                key={number.id}
                                value={number.title}                               
                                label={<div className='packageRadioLabel'>
                                    <div className='packageRadioLabelHead'>{number.title}</div>
                                    {number.description.length > 0 && <AlertDialog description={number.description}/>}
                                    
                                    <div className='packageRadioLabelHeadBody'>
                                        <span>
                                            {number.displayPrice.currency} 
                                            {Number.isInteger(number.displayPrice.discounted) ? number.displayPrice.discounted : number.displayPrice.discounted.toFixed(2)}
                                        </span>
                                        <span className='priceDelete'>
                                            { number.displayPrice.original > number.displayPrice.discounted && number.displayPrice.currency } 
                                            {number.displayPrice.original > number.displayPrice.discounted && (Number.isInteger(number.displayPrice.original) ? number.displayPrice.original : number.displayPrice.original.toFixed(2)) }
                                        </span>
                                    </div>
                                    {number.showExtral ? <div className='extraDiscount'>Buy more for extra discount</div> : ''}
                                </div>}
                                control={<Radio id={number.id} onChange={this.radioChange} className='packageRadio' color="primary" />}
                                labelPlacement="start"
                                style={{ position: 'relative',height:'90px'}}
                            />
                        ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
        );
    }
}

PackageRadio.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PackageRadio);