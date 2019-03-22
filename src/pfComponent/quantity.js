import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
                    
                       dealitemTypes: this.props.dealitemTypes,
                       quantity: [], //当前数量
                       unitPrice: [], //折扣价
                       originalPrice: [], //原价
                       dealItemPriceFalseArray: [], //default 为false的price 2维数组
                       meetConditionPrices: [],
                       transferTimaslotId: this.props.confirmInfo.timeslotId,
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
        this.morediscountprice = [];//加1操作时存储多买的数量优惠的折扣价 好让quantity - 1时 折扣价回显
        this.morequantity = [];//加1操作时存储多买的数量 好让quantity - 1时 折扣价回显
        this.backforward = []; //加1操作时存储折扣价 好让quantity - 1时 折扣价回显
        this.backremindflag = []; //加1操作时存储discountremind 显示的标志 好让quantity - 1时discountremind回显
        this.tempuniteprice = 0;
        this.addQuantity = this.addQuantity.bind(this);
        this.minusQuantity = this.minusQuantity.bind(this);
        
    }
   
    componentWillMount(){
        for(let i = 0; i<this.state.dealitemTypes.length; i++){
            this.state.peopleandPrice.title[i] = this.state.dealitemTypes[i].title;
            this.state.peopleandPrice.id[i] = this.state.dealitemTypes[i].id;
            //判断购买上限 不能超过package里的maximumPax
            if(this.state.dealitemTypes[i].maxQuantity !== -1){
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
                return ele.default === true;
            });

            this.morediscountprice[i] = [];
            this.morequantity[i] = [];
            this.backforward[i] = [];
            this.backforward[i].push(dealItemPrice.unitPrice);
            this.backremindflag[i] = [];
            // 这里的两个dealitemprice需要注意。
            this.state.dealItemPrice.push(dealItemPrice.unitPrice);
            this.state.unitPrice[i] = dealItemPrice.unitPrice;
            this.state.peopleandPrice.price[i] = dealItemPrice.unitPrice; //初始渲染时需要传到外面的折扣价 没有点击
            this.state.originalPrice[i] = dealItemPrice.originalPrice;

            //查找default=false的price
            let dealItemPriceFalse = this.state.dealitemTypes[i].prices.filter(function(ele){
                return ele.default !== true;
            });            
            this.state.dealItemPriceFalseArray[i] = dealItemPriceFalse;
            //buy more reminder的初始状态 与初始化过滤计算
            this.state.isdiscountReminderDisplay[i] = false;
            this.displayDiscountedpriceReminder(this.state.quantity[i], i, this.state.unitPrice[i]);
        }
        this.props.handlepeopleandPrice(this.state.peopleandPrice); //子传父传peopleandprice     
    }

   
    
    //加1过程判断是否显示discountedpriceReminder
    displayDiscountedpriceReminder(currentQuantity, index, currentdiscountPrice){
        //每次需要清空操作
        this.state.meetConditionPrices = [];
        for(let j=0; j<this.state.dealItemPriceFalseArray[index].length; j++){
            if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity && this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(this.state.transferTimaslotId === this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity){              
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);            
            }
        }
        console.log(this.state.meetConditionPrices);
        this.state.meetConditionPrices.sort(function(a,b){
            return a.conditions.quantity.minimum - b.conditions.quantity.minimum;
        })
        console.log(this.state.meetConditionPrices);
        if(this.state.meetConditionPrices.length>0){        
            for(let i = 0; i<this.state.meetConditionPrices.length; i++){
                if(currentQuantity < this.state.meetConditionPrices[i].conditions.quantity.minimum && this.state.meetConditionPrices[i].unitPrice < currentdiscountPrice){  
                    this.state.numbermore[index] = this.state.meetConditionPrices[i].conditions.quantity.minimum - currentQuantity;
                    this.morequantity[index].push(this.state.numbermore[index]);            
                    let newdiscountprice = this.state.meetConditionPrices[i].unitPrice;
                    this.state.morediscountprice[index] = this.state.meetConditionPrices[i].conditions.quantity.minimum*(currentdiscountPrice - newdiscountprice);
                    this.morediscountprice[index].push(this.state.morediscountprice[index]);
                    this.state.isdiscountReminderDisplay[index] = true;
                    this.backremindflag[index].push(true);               
                    break;
                }else if(i === this.state.meetConditionPrices.length-1){   
                    this.morequantity[index].push('');
                    this.morediscountprice[index].push('');
                    this.state.isdiscountReminderDisplay[index] = false;
                    this.backremindflag[index].push(false);                
                }              
            }
        }else{
            this.state.isdiscountReminderDisplay[index] = false;
            this.backremindflag[index].push(false);
            this.morequantity[index].push('');
            this.morediscountprice[index].push('');
        }
    }

    //数量加1操作中获取满足condition要求的price  并按priority排序 覆盖旧的unitprice 的封装
    getMeetConditionPricesByAdd(currentQuantity, index, currentdiscountPrice){
        this.state.meetConditionPrices = [];
        for(let j=0; j<this.state.dealItemPriceFalseArray[index].length; j++){
            if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity && this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(((currentQuantity+1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity+1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)) && (this.state.transferTimaslotId === this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.quantity){
                if((currentQuantity+1>=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.minimum) && (currentQuantity+1<=this.state.dealItemPriceFalseArray[index][j].conditions.quantity.maximum)){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }else if(this.state.dealItemPriceFalseArray[index][j].conditions.timeslot){
                if(this.state.transferTimaslotId === this.state.dealItemPriceFalseArray[index][j].conditions.timeslot.id){
                    this.state.meetConditionPrices.push(this.state.dealItemPriceFalseArray[index][j]);
                }
            }
        }
        this.state.meetConditionPrices.sort(function(a,b){
            return a.priority - b.priority;
        })
        console.log(this.state.meetConditionPrices)
        if(this.state.meetConditionPrices.length>0){
            if(this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice < currentdiscountPrice){                            
                let newdiscountprice = this.state.meetConditionPrices[this.state.meetConditionPrices.length-1].unitPrice;          
                this.state.peopleandPrice.price[index] = newdiscountprice; //加操作后的新的折扣价存储起来传给父组件
                this.state.afterAddDiscount[index] = newdiscountprice; //这里赋值传给discountreminder函数
                let temp1 = {...this.state.discountprice, [index]:newdiscountprice};
                this.tempuniteprice = newdiscountprice < this.state.unitPrice[index] ? newdiscountprice : this.state.unitPrice[index];
                let temp2 = {...this.state.unitPrice, [index]:this.tempuniteprice};
                this.setState({unitPrice: temp2});                            
            }else{
                this.state.afterAddDiscount[index] = currentdiscountPrice; //加操作后的新的折扣价存储起来传给父组件 只是没有满足条件的折扣价
                this.tempuniteprice = currentdiscountPrice;
            }
        }else{
            this.state.afterAddDiscount[index] = currentdiscountPrice; //加操作后的新的折扣价存储起来传给父组件 筛选条件都没有
            this.tempuniteprice = currentdiscountPrice;
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
        this.setState({calpop: true});
        var totalnum = 0;
        for(let i = 0; i<totalquantity.length; i++){
            totalnum += totalquantity[i];
        }
        this.getMeetConditionPricesByAdd(currentQuantity,index,e.currentTarget.getAttribute('currentdiscountprice'));
        // this.displayDiscountedpriceReminder(currentQuantity+1,index,this.state.afterAddDiscount[index]);
        //数量加一操作 考虑的情况有点多
        if(this.state.dealitemTypes[index].maxQuantity === -1){
            if(totalnum < this.state.maxQuantity[index]){
                this.displayDiscountedpriceReminder(currentQuantity+1,index,this.state.afterAddDiscount[index]);

                let temp2 = this.state.quantity;
                temp2[index] = currentQuantity+1;
                this.setState({quantity: temp2}, function(){
                    this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                });  
                this.backforward[index].push(this.tempuniteprice);        
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
                    this.displayDiscountedpriceReminder(currentQuantity+1,index,this.state.afterAddDiscount[index]);

                    let temp2 = this.state.quantity;
                    temp2[index] = currentQuantity+1;
                    this.setState({quantity: temp2}, function(){
                        this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                    });
                    this.backforward[index].push(this.tempuniteprice);          
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
                    this.displayDiscountedpriceReminder(currentQuantity+1,index,this.state.afterAddDiscount[index]);

                    let temp2 = this.state.quantity;
                    temp2[index] = currentQuantity+1;
                    this.setState({quantity: temp2}, function(){
                        this.state.peopleandPrice.number[index] = this.state.quantity[index]; //加操作后的新的票数存储起来传给父组件
                    }); 
                    this.backforward[index].push(this.tempuniteprice);         
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
        this.setState({calpop: false});
        //数量减一操作
        if(currentQuantity > this.state.minQuantity[index]){
            //-1过程中折扣价回显操作
            this.backforward[index].pop();
            let tmpbackforwarddiscountprice = this.backforward[index][this.backforward[index].length-1]
            let temp1 = {...this.state.unitPrice, [index]:tmpbackforwarddiscountprice};
            this.setState({unitPrice: temp1});

            //-1过程判断discountremind显示标志的回显操作
            this.backremindflag[index].pop();
            let tmpbackremindflag = this.backremindflag[index][this.backremindflag[index].length-1];
            let temp2 = {...this.state.isdiscountReminderDisplay, [index]:tmpbackremindflag};
            this.setState({isdiscountReminderDisplay: temp2});

            //-1过程中更多购买数量的回显操作
            this.morequantity[index].pop();
            let tmpmorequantity = this.morequantity[index][this.morequantity[index].length-1];
            let temp4 = {...this.state.numbermore, [index]:tmpmorequantity};
            this.setState({numbermore: temp4});

            //-1过程中更多购买数量折扣价的回显操作
            this.morediscountprice[index].pop();
            let tmpmorediscountprice = this.morediscountprice[index][this.morediscountprice[index].length-1];
            let temp5 = {...this.state.morediscountprice, [index]:tmpmorediscountprice};
            this.setState({morediscountprice: temp5});

            //数量-1操作
            let temp3 = this.state.quantity;
            temp3[index] = currentQuantity-1;
            this.setState({quantity: temp3}, function(){
                this.state.peopleandPrice.number[index] = this.state.quantity[index]; //减操作后的新的票数存储起来传给父组件
            });
        }else{
            if(this.state.minQuantity[index] > 0){
                this.handleClick(this.state.minQuantity[index]);
                    //3.5s后warnmessage消失
                    setTimeout(() => {
                        this.handleClose();
                    }, 3500);
            }
            return false;
        }
        // this.displayDiscountedpriceReminder(currentQuantity,index,this.state.afterAddDiscount[index]);    
        this.props.handlepeopleandPrice(this.state.peopleandPrice); //子传父传peopleandprice
         //重新点击减按钮时隐藏下面所有模块
       if((this.props.belowFlagOne && this.props.belowFlagTwo) || this.props.belowFlagOne || this.props.belowFlagTwo){
        this.props.onHandleBelowFlag(false,false,'buttonText');
        }
    } 
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
                        <div key={index}>
                            <Grid container spacing={24} key={index}>
                                <Grid item xs={8}>
                                    <div className={classes.paper} style={{height:'80px'}}>
                                        <div style={{ textAlign: 'left' }}>{ele.title}</div>
                                        <div style={{ textAlign: 'left', marginTop: 5 }}>
                                            <span className='quantityInitialPrice'>{currency} {that.state.unitPrice[index]}</span>
                                            <span className='midDelete'>{that.state.originalPrice[index] > that.state.unitPrice[index] ? currency + that.state.originalPrice[index] : null }</span>
                                        </div>
                                        {that.state.isdiscountReminderDisplay[index] && <div id='morediscount' style={{ textAlign: 'left', fontSize:'14px' }}>Buy {that.state.numbermore[index]} more to save {currency} {that.state.morediscountprice[index]}</div>}
                                        
                                    </div>
                                </Grid>
                                <Grid item xs={4}>
                                    <div id='quantityRight' className={classes.paper}>
                                        <span className='quantityNo'>{that.state.quantity[index]}</span>
                                        <div className='quantityjiajian'>
                                            <span className='sumbmitStyle' currentdiscountprice={that.state.unitPrice[index]}  onClick={that.minusQuantity.bind(this,that.state.quantity[index],index)}>-</span>
                                            <span className='addStyle' currentdiscountprice={that.state.unitPrice[index]} onClick={that.addQuantity.bind(this,that.state.quantity[index],index,that.state.quantity)}>+</span>                
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
                            message={<span id="message-id">{that.state.calpop?`Sorry, maximum quantity is ${that.state.viewQuantity}. Please purchase separately.`:`You must select at least ${that.state.viewQuantity} per purchase.`}</span>}
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
