import React from 'react';
import '../App.css';

//time slot
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { FormattedMessage, FormattedDate } from 'react-intl';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },

});

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            currentIndex: null,
            preferedSodates: props.preferedDates,
            packageidanother: []
        };
    }
    
   
    //切换package
    componentWillReceiveProps(nextProps){
        this.setState({
            preferedSodates: nextProps.preferedDates
        });
        //根据两次选择的packageid 不一样 来使date初始化  而 date 一下组件交互时date保持原样
       let tmppackageidanother = this.state.packageidanother;
       tmppackageidanother.unshift(nextProps.packageid);
       this.setState({packageidanother: tmppackageidanother});
       if(tmppackageidanother.length>=2){
            if(tmppackageidanother[0] !== tmppackageidanother[1]){
                this.setState({currentIndex: null})
            }
       }
    }
    handleClick(event) {
        if(event.currentTarget.getAttribute('prefereddatevalue') === '1'){
            this.setState({
                currentIndex: parseInt(event.currentTarget.getAttribute('index')),
            },function(){
                
                // this.state.currentIndex = null; //切换package时 date的样式清零
            });
            this.props.onHandleDate(event.currentTarget.getAttribute('value'));
            
           //再次点击date 显示隐藏quantity下的模块
           if((this.props.belowFlagOne && this.props.belowFlagTwo) || this.props.belowFlagOne || this.props.belowFlagTwo){
            this.props.onHandleDownFlag(false,false,'buttonText');
            }
        }
        
    }
    
    render() {
       
        const week = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];
        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const now = new Date();
        let preferedDateFlag = [];
        let prefereddateFlag = [];
        const items = numbers.map((i) => {
            const date = new Date(+now + i * 3600 * 1000 * 24).getDate();
            const day = new Date(+now + i * 3600 * 1000 * 24).getDay();
            for(let j = 0; j < this.state.preferedSodates.length; j++){
                if(+date === Number(this.state.preferedSodates[j])){
                    preferedDateFlag[i] = true;
                    prefereddateFlag[i] = 1;
                }
            }
            return (<li id="item" key={i}>
                <p>{week[day]}</p>
                <p onClick={this.handleClick} prefereddatevalue={prefereddateFlag[i]} style={{color : (preferedDateFlag[i] ? '#000f23':'#e6e6e6')}} value={date < 10? '0'+date:date} index={i} className={this.state.currentIndex === i ? 'current' : ''}>{date < 10? '0'+date:date}</p>
            </li>)
        });
        return (
            items
        )
    }
}
class DatePicker extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            passTime: {},
            currentindex: null
        };
        this.currentindex = null;
        this.handleDate = this.handleDate.bind(this);
        this.handleTimaslotId = this.handleTimaslotId.bind(this);
        this.handleDownFlag = this.handleDownFlag.bind(this);
    }

    componentWillReceiveProps(nextProps){
        //接收标志用于判断是否显示quantity下面的模块
        this.setState({nextstate: nextProps.belowFlagOne, afterFirstConfirm: nextProps.belowFlagTwo})
    }
    handleDate(date){
        //点击date时 timeslot混滚初始位置。
        if(this.state.selectDate && document.getElementsByClassName('leftslot')[0]!==undefined){         
            document.getElementsByClassName('leftslot')[0].scroll(0,0);
        }
        //傳所有時間到父組件
        const passtime = this.state.passTime;
        var dateBuynow = this.props.packages.dates.filter(function(ele){
            return date === ele.date.substring(8,10);
        });
        passtime['dateBuynow'] = dateBuynow[0].date;
        passtime['date'] = date;
        passtime['year'] = new Date().getFullYear();
        passtime['month'] = new Date().getMonth() + 1;
        this.setState({
            selectDate: date,
            passTime: passtime
        });
        this.props.onChangeHandledates(date,this.state.passTime);
        
    }
    handleTimaslotId(event){
        this.currentindex = parseInt(event.currentTarget.getAttribute('value'));
        //傳所有時間到父組件
        const passtime = this.state.passTime;
        passtime['shifenmiao'] = event.currentTarget.getAttribute('time');
        this.setState({
            passTime: passtime
        })
        this.props.onChangeTimeslotId(event.currentTarget.getAttribute('value'), this.state.passTime);
        //再次点击timaslotid 显示隐藏quantity下的模块
        if((this.props.belowFlagOne && this.props.belowFlagTwo) || this.props.belowFlagOne || this.props.belowFlagTwo){
            this.props.onHandleBelowFlag(false,false,'buttonText');
            }
    }

    //接收calenda子组件传来的数据  并将其传给父组件app.js
    handleDownFlag(flagone,flagtwo,index){
        this.props.onHandleBelowFlag(flagone,flagtwo,index);
    }
    render() {
        let pickDate = this.state.selectDate;
        let timeslotTittle = [];
        let preferedDate = [];
        let packageId;
        if(this.props.packages !== undefined){
            packageId = Number(this.props.packages.id);
            for(let i = 0; i<this.props.packages.dates.length; i++){
                preferedDate[i] = this.props.packages.dates[i].date.substring(8,10); //没有传来的date dimed禁止
                if(pickDate === this.props.packages.dates[i].date.substring(8,10)){       
                    timeslotTittle = this.props.packages.dates[i].timeslots;                   
                }
            }
        }  
        const { classes } = this.props;
        // const week = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];
        const Month = ['Jan', 'Fre', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
        const now = new Date();
        // const day = now.getDay();
        // const date = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        let that = this;
        return (          
            <div id="datepicker">
                {/* <div className='sectionHeader'>SELECT DATE Today is {week[day]},{date} {Month[month]} {year}</div> */}
                <div className='sectionHeader'>
                    <FormattedMessage
                        id='selectdate'
                        defaultMessage='SELECT DATE Today is'
                    />
                    <FormattedDate value={new Date()}/>
                </div>
                <div className="overflow">
                    <div className='datePickerHead'>{Month[month]} {year}</div>
                    <div className="calendar">
                        <ul className="list">
                            <Calendar packageid={packageId}  onHandleDate={this.handleDate} onHandleDownFlag={this.handleDownFlag} belowFlagOne={this.state.nextstate} belowFlagTwo={this.state.afterFirstConfirm} preferedDates={preferedDate}/>
                        </ul>
                    </div>
                </div>
                {timeslotTittle.length>0 && <div className='sectionHeader'>
                <FormattedMessage
                    id='selecttime'
                    defaultMessage='SELECT TIME'
                />
                </div>}
                {timeslotTittle.length>0 && 
                    <div style={{width:'100%', overflow:'hidden', height: 50}}>
                        <div className='leftslot' style={{width:'100%',height: 58, overflowX:'auto'}}>
                            <div style={{width:1100, overflow:'hidden', height:'100%'}}>
                                {   
                                    timeslotTittle.map(function (ele, index) {
                                        return (                          
                                            <Button key={index} value={ele.id} time={ele.time} style={{borderColor: (that.currentindex === ele.id) ? '#ff8400':'',color: (that.currentindex === ele.id) ? '#ff8400':''}} variant="outlined" onClick={that.handleTimaslotId} className={classes.button}>
                                                {ele.title}
                                            </Button>    
                                        )
                                    })                  
                                }
                            </div>
                        </div>
                    </div>
                }
                
            </div>

        );
    }
}
DatePicker.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DatePicker);;