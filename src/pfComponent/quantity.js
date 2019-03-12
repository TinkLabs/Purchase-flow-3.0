import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';

import '../App.css';

import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

class Quantity extends Component {
    constructor(props) {
        super(props);
        this.state = { number: 0 ,
                       discountprice: [], //新的折扣价
                       dealitemTypes: this.props.dealitemTypes,
                       quantity: [], //当前数量
                       unitPrice: [], //折扣价
                       originalPrice: [], //原价
                       dealItemPriceFalseArray: [], //default 为false的price 2维数组
                       meetConditionPrices: [],
                       transferTimaslotId: this.props.timeslotId,
                       dealItemPrice: [], //初始default:true的price 不要写成对象形式
                       maxQuantity: [], //数量最大值
                       viewQuantity: 0, //提示最大数量
                       minQuantity: [], //数量最小值
                       isdiscountReminderDisplay: [],
                       numbermore: [],
                       morediscountprice: [],
                       afterAddDiscount: [], //discountereminder函数需要下下步的折扣价   这里用来存储
                       peopleandPrice: {  //供传给promotionList使用
                           number: [],
                           price: [],
                           title: [],
                           id: []
                       },
                       open: false,
                       vertical: 'bottom',
                       horizontal: 'center'               
                    };
        this.addQuantity = this.addQuantity.bind(this);
        this.minusQuantity = this.minusQuantity.bind(this);
        
    }
   
    componentWillMount(){
        for(let i = 0; i<this.state.dealitemTypes.length; i++){
            this.state.peopleandPrice.title[i] = this.state.dealitemTypes[i].title;
            this.state.peopleandPrice.id[i] = this.state.dealitemTypes[i].id;
            //判断购买上限 不能超过package里的maximumPax
            if(this.state.dealitemTypes[i].maxQuantity != -1){
                this.state.maxQuantity[i] = this.state.dealitemTypes[i].maxQuantity > this.props.packages.maximumPax ? this.props.packages.maximumPax : this.state.dealitemTypes[i].maxQuantity;
            }else{
                this.state.maxQuantity[i] = this.props.packages.maximumPax;
            }
            //判断最低购买要求
            if(this.state.dealitemTypes[i].minQuantity > 0){
                this.state.quantity[i] = this.state.dealitemTypes[i].minQuantity;
                this.state.minQuantity[i] = this.state.dealitemTypes[i].minQuantity;
                this.state.peopleandPrice.number[i] = this.state.dealitemTypes[i].minQuantity; //初始渲染时需要传到外面的票数 没有点击
            }else{
                this.state.quantity[i] = 0;
                this.state.minQuantity[i] = 0;
                this.state.peopleandPrice.number[i] = 0; //初始渲染时需要传到外面的票数 没有点击
            }

            //查找default=true的price
            let dealItemPrice = this.state.dealitemTypes[i].prices.find(function(ele){
                return ele.default == true;
            });
            // 这里的两个dealitemprice需要注意。
            this.state.dealItemPrice.push(dealItemPrice.unitPrice);
            this.state.unitPrice[i] = dealItemPrice.unitPrice;
            this.state.peopleandPrice.price[i] = dealItemPrice.unitPrice; //初始渲染时需要传到外面的折扣价 没有点击
            this.state.originalPrice[i] = dealItemPrice.originalPrice;

            //查找default=false的price
            let dealItemPriceFalse = this.state.dealitemTypes[i].prices.filter(function(ele){
                return ele.default != true;
            });             
            this.state.dealItemPriceFalseArray[i] = dealItemPriceFalse;
            //buy more reminder的初始状态 与初始化过滤计算
            this.state.isdiscountReminderDisplay[i] = false;
            this.displayDiscountedpriceReminder(this.state.quantity[i]+1, i, this.state.unitPrice[i]);
            
        }
        console.log(this.state.peopleandPrice, 299999);
        this.props.handlepeopleandPrice(this.state.peopleandPrice); //子传父传peopleandprice
    }
    //加1过程判断是否显示discountedpriceReminder
    displayDiscountedpriceReminder(currentQuantity, index, currentdiscountPrice){
        console.log(currentdiscountPrice);
        //每次需要清空操作
        this.state.meetConditionPrices = [];
        for(let j=0; j<this.state.dealItemPriceFalseArray[index].length; j++){
            if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity && this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(((currentQuantity>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)) && (this.state.transferTimaslotId == this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity){
                if((currentQuantity>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }
        }
        this.state.meetConditionPrices.sort(function(a,b){
            return a.priority - b.priority;
        })
        if(this.state.meetConditionPrices.length>0){
            if(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice < currentdiscountPrice){ 
                    this.state.numbermore[index] =  this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].conditions.quantity.minimum;                                         
                    let newdiscountprice = this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice; 
                    this.state.morediscountprice[index] = this.state.numbermore[index]*(currentdiscountPrice - newdiscountprice); 
                    this.state.isdiscountReminderDisplay[index] = true;                             
            }else{
                this.state.isdiscountReminderDisplay[index] = false;
            }
        }else{
            this.state.isdiscountReminderDisplay[index] = false;
        }
    }

    //减1过程判断是否显示discountedpriceReminder

    //数量加1操作中获取满足condition要求的price  并按priority排序 覆盖旧的unitprice 的封装
    getMeetConditionPricesByAdd(currentQuantity, index, currentdiscountPrice){
        this.state.meetConditionPrices = [];
        for(let j=0; j<this.state.dealItemPriceFalseArray[index].length; j++){
            if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity && this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(((currentQuantity+1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity+1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)) && (this.state.transferTimaslotId == this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity){
                if((currentQuantity+1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity+1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(this.state.transferTimaslotId == this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }
        }
        this.state.meetConditionPrices.sort(function(a,b){
            return a.priority - b.priority;
        })
        if(this.state.meetConditionPrices.length>0){
            if(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice < currentdiscountPrice){
                console.log(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice);                             
                    let newdiscountprice = this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice;
                    this.state.peopleandPrice.price[index] = newdiscountprice; //加操作后的新的折扣价存储起来传给父组件
                    console.log(this.state.peopleandPrice);
                    this.state.afterAddDiscount[index] = newdiscountprice; //这里赋值传给discountreminder函数
                    let temp1 = {...this.state.discountprice, [index]:newdiscountprice};
                    //新的折扣季覆盖旧的uniteprice             
                    this.setState({discountprice: temp1});              
            }else{
                this.state.afterAddDiscount[index] = currentdiscountPrice; //加操作后的新的折扣价存储起来传给父组件 只是没有满足条件的折扣价
            }
        }else{
            this.state.afterAddDiscount[index] = currentdiscountPrice; //加操作后的新的折扣价存储起来传给父组件 筛选条件都没有
        }
    }

    //数量减1操作中获取满足condition要求的price  并按priority排序 覆盖旧的unitprice 的封装
    getMeetConditionPricesByMinus(currentQuantity, index, currentdiscountPrice){
        this.state.meetConditionPrices = [];
        if(currentQuantity-1 > this.state.minQuantity[index]){
            for(let j=0; j<this.state.dealItemPriceFalseArray[index].length; j++){
                if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity && this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                    if(((currentQuantity-1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity-1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)) && (this.state.transferTimaslotId == this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id)){
                        this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                    }
                }else if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity){
                    if((currentQuantity-1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity-1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)){
                        this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                    }
                }else if(this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                    if(this.state.transferTimaslotId == this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id){
                        this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                    }
                }
            }
            this.state.meetConditionPrices.sort(function(a,b){
                return a.priority - b.priority;
            })
            if(this.state.meetConditionPrices.length>0){
                if(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice < currentdiscountPrice){
                    console.log(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice);
                    this.state.afterAddDiscount[index] = newdiscountprice;   //这里赋值传给discountreminder函数                          
                        let newdiscountprice = this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice;
                        this.state.peopleandPrice.price[index] = newdiscountprice; //减操作后的新的折扣价存储起来传给父组件
                        console.log(this.state.peopleandPrice);
                        let temp1 = {...this.state.discountprice, [index]:newdiscountprice};
                        //新的折扣季覆盖旧的uniteprice             
                        this.setState({discountprice: temp1});              
                }else{
                    this.state.peopleandPrice.price[index] = currentdiscountPrice; //减操作后的新的折扣价存储起来传给父组件
                    console.log(this.state.peopleandPrice);
                }
            }else{
                //无过滤的conditions放default 为true的折扣价
                // let newdiscountprice = this.state.dealItemPrice.unitPrice;
                // let temp2 = {...this.state.discountprice, [index]:newdiscountprice};
                // this.setState({discountprice: temp2});  
                this.state.peopleandPrice.price[index] = currentdiscountPrice; //减操作后的新的折扣价存储起来传给父组件
                console.log(this.state.peopleandPrice);
            }
        }else{
            //减一操作到最小时还原成最小quantity时的折扣价。
            let newdiscountprice = this.state.dealItemPrice[index];
            this.state.peopleandPrice.price[index] = newdiscountprice; //减操作后的新的折扣价存储起来传给父组件
            console.log(this.state.peopleandPrice);
            this.state.afterAddDiscount[index] = newdiscountprice; //这里赋值传给discountreminder函数
            let temp3 = {...this.state.discountprice, [index]:newdiscountprice};
            this.setState({discountprice: temp3});
        }
        
    }

    handleClick(msg){
       
        this.setState({ 
            open: true,
            viewQuantity: msg
        });
      };
    handleClose = () => {
    this.setState({ open: false });
    };
    addQuantity(currentQuantity,index,totalquantity,e){
        console.log(totalquantity);
        console.log(this.state.maxQuantity[index]);
        var totalnum = 0;
        for(let i = 0; i<totalquantity.length; i++){
            totalnum += totalquantity[i];
        }
        console.log(totalnum);
        // console.log(e.currentTarget.getAttribute('currentdiscountprice')); //这里要用e获取当前的折扣价。
        this.getMeetConditionPricesByAdd(currentQuantity,index,e.currentTarget.getAttribute('currentdiscountprice'));
        console.log(this.state.meetConditionPrices);
        console.log(this.state.unitPrice[index]);
        this.displayDiscountedpriceReminder(currentQuantity+2,index,this.state.afterAddDiscount[index]);
        //数量加一操作 考虑的情况有点多
        if(this.state.dealitemTypes[index].maxQuantity === -1){
            if(totalnum < this.state.maxQuantity[index]){
                let temp2 = this.state.quantity;
                temp2[index] = currentQuantity+1;
                this.setState({quantity: temp2}, function(){
                    this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                });          
                console.log(this.state.peopleandPrice);
            }else{
                this.handleClick(this.state.maxQuantity[index]);
                //3.5s后warnmessage消失
                setTimeout(() => {
                    this.handleClose();
                }, 3500);
                return false;
            }
        }else{
            if(this.state.dealitemTypes[index].maxQuantity > this.props.packages.maximumPax){
                if(totalnum < this.state.maxQuantity[index]){
                    let temp2 = this.state.quantity;
                    temp2[index] = currentQuantity+1;
                    this.setState({quantity: temp2}, function(){
                        this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                    });          
                    console.log(this.state.peopleandPrice);
                }else{
                    this.handleClick(this.state.maxQuantity[index]);
                    //3.5s后warnmessage消失
                    setTimeout(() => {
                        this.handleClose();
                    }, 3500);
                    return false;
                }
            }else{
                if(currentQuantity < this.state.maxQuantity[index]){
                    let temp2 = this.state.quantity;
                    temp2[index] = currentQuantity+1;
                    this.setState({quantity: temp2}, function(){
                        this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                    });          
                    console.log(this.state.peopleandPrice);
                }else{
                    this.handleClick(this.state.maxQuantity[index]);
                    //3.5s后warnmessage消失
                    setTimeout(() => {
                        this.handleClose();
                    }, 3500);
                    return false;
                }
            }
            
        }
       
        this.props.handlepeopleandPrice(this.state.peopleandPrice); //子传父传peopleandprice
       //重新点击加按钮时隐藏下面所有模块
       if((this.props.belowFlagOne && this.props.belowFlagTwo) || this.props.belowFlagOne || this.props.belowFlagTwo){
           this.props.onHandleBelowFlag(false,false,'buttonText');
       }
        
    }
    minusQuantity(currentQuantity,index,e) {
        this.getMeetConditionPricesByMinus(currentQuantity,index,e.currentTarget.getAttribute('currentdiscountprice'));
        console.log(this.state.meetConditionPrices);
        console.log(this.state.unitPrice[index]);
             
        //数量减一操作
        if(currentQuantity > this.state.minQuantity[index]){
            let temp3 = this.state.quantity;
            temp3[index] = currentQuantity-1;
            this.setState({quantity: temp3}, function(){
                this.state.peopleandPrice.number[index] = this.state.quantity[index]; //减操作后的新的票数存储起来传给父组件
            });
            console.log(this.state.peopleandPrice);
        }else{
            return false;
        }
        this.displayDiscountedpriceReminder(currentQuantity,index,this.state.afterAddDiscount[index]);    
        this.props.handlepeopleandPrice(this.state.peopleandPrice); //子传父传peopleandprice
         //重新点击减按钮时隐藏下面所有模块
       if((this.props.belowFlagOne && this.props.belowFlagTwo) || this.props.belowFlagOne || this.props.belowFlagTwo){
        this.props.onHandleBelowFlag(false,false,'buttonText');
        }
    }
    
    //覆盖旧的折扣价 unitprice
   
    render() {  
        const { classes } = this.props; 
        const { vertical, horizontal, open } = this.state;       
        let that = this;
        const currency = this.props.confirmInfo.packageInfo.currency
        return (
            <div className={classes.root}>
                <div className='sectionHeader'>
                    <FormattedMessage
                        id='selectquantity'
                        defaultMessage='SELECT QUANTITY'
                    />
                </div>
                {this.state.dealitemTypes.map(function (ele, index) {
                    return (
                        <div>
                            <Grid container spacing={24} key={index}>
                                <Grid item xs={8}>
                                    <div className={classes.paper} style={{height:'80px'}}>
                                        <div style={{ textAlign: 'left' }}>{ele.title}</div>
                                        <div style={{ textAlign: 'left', marginTop: 5 }}>
                                            <span className='quantityInitialPrice'>{currency} {that.state.unitPrice[index]> that.state.discountprice[index] ? that.state.discountprice[index] : that.state.unitPrice[index]}</span>
                                            <span className='midDelete'>{that.state.originalPrice[index] > (that.state.unitPrice[index]> that.state.discountprice[index] ? that.state.discountprice[index] : that.state.unitPrice[index]) ? currency + that.state.originalPrice[index] : null }</span>
                                        </div>
                                        {that.state.isdiscountReminderDisplay[index] && <div style={{ textAlign: 'left' }}>Buy {that.state.numbermore[index]} more to save {currency} {that.state.morediscountprice[index]}</div>}
                                        
                                    </div>
                                </Grid>
                                <Grid item xs={4}>
                                    <div id='quantityRight' className={classes.paper}>
                                        <span className='quantityNo'>{that.state.quantity[index]}</span>
                                        <div className='quantityjiajian'>
                                            <span className='sumbmitStyle' currentdiscountprice={that.state.unitPrice[index]> that.state.discountprice[index] ? that.state.discountprice[index] : that.state.unitPrice[index]} onClick={that.minusQuantity.bind(this,that.state.quantity[index],index)}>-</span>
                                            <span className='addStyle' currentdiscountprice={that.state.unitPrice[index]> that.state.discountprice[index] ? that.state.discountprice[index] : that.state.unitPrice[index]} onClick={that.addQuantity.bind(this,that.state.quantity[index],index,that.state.quantity)}>+</span>                
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                            <Snackbar
                            style={{marginBottom: '52px'}}
                            anchorOrigin={{ vertical, horizontal }}
                            open={open}
                            onClose={that.handleClose}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span id="message-id">Sorry, maximum quantity is {that.state.viewQuantity}. Please purchase separately.</span>}
                            />
                        </div>
                    );
                    
                })}
               
            </div>
        );
    }
}

Quantity.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Quantity);
