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

import renderHTML from 'react-render-html';

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
  
    radioChange(displayPrice, event){
        console.log(displayPrice, event.target.id, 2333);
        const packageInfo = {
            id: event.target.id,
            currency: displayPrice.currency,
        }
        this.props.getPackageInfo('packageInfo', packageInfo);
        this.setState({ value: event.target.value });
        if(this.props.belowFlagOne || this.props.belowFlagTwo || this.props.selectIdPackageDateLengthTwo == 0 || this.props.quantityDisplay){
            this.props.onChangeAllFlag(false,1,'buttonText')
        }
    }
    
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
                    packageList[i].showMinimumExtral = true; //显示minimum reminder的标志
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
                            
                        >
                        {packageList.map((number) => (
                            <FormControlLabel
                                key={number.id}
                                value={number.title}
                                control={<Radio id={number.id} onChange={this.radioChange.bind(this, number.displayPrice)} className='packageRadio' color="primary" />}                               
                                label={<div className='packageRadioLabel'>
                                    <div className='packageRadioLabelHead'>{number.title}</div>
                                    {number.description.length > 0 && <AlertDialog description={renderHTML(number.description)}/>}
                                    
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
                                    {number.showExtral || number.showMinimumExtral ? (number.showExtral && number.showMinimumExtral ? <div className='extraDiscount'>You must select {number.minimumPax} or more for this package</div> : <div className='extraDiscount'>Buy more for extra discount</div>) : ''}
                                </div>}                  
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
