import React, { Component } from 'react';
import 'whatwg-fetch';
import './App.css';

import Quantity from './pfComponent/quantity'
import Userdetails from './pfComponent/userDetails'
import QuestionList from './pfComponent/questionList'
import Promotionlist from './pfComponent/promotionList'
import Confirmation from './pfComponent/confirmation'
import PaymentMethod from './pfComponent/paymentMethod'
import BottomButton from './pfComponent/bottomButton'
// import SelectPackage from './pfComponent/package'
import PackageRadio from './pfComponent/packageRadio'
import DatePicker from './pfComponent/datePicker'

// import {get} from './api/serverapi'

import PropTypes from 'prop-types';

// request
import request from './api/request';
import utils from './utils';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      confirmInfo: {
        timeslotId: ''
      },
      peopleandPriceandTitle: [], //给confirmation用 有 count price title
      peopleandTitle: {}, //给confirmation用
      nextstate: false, //显示your details; questionlist ,promotionlist 的标志
      afterFirstConfirm: false, //显示confirmation的标志
      promotionTitle: '',
      quantityDisplay: false,
      selectIdPackageDateLengthTwo: 1,
      controlQuantity: true,
      selectIdPackage: {}, //new
      selectIdPackageDateLength: 0,
      dealitemTypes: []
    };
    this.handlePackageid = this.handlePackageid.bind(this);
    this.handleSelectedDate = this.handleSelectedDate.bind(this);
    this.handleTimeslotId = this.handleTimeslotId.bind(this);
    this.peopleandPrice = this.peopleandPrice.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleFirstConfirm = this.handleFirstConfirm.bind(this);
    this.handlePromotionTitle = this.handlePromotionTitle.bind(this);
    this.handleBelowFlag = this.handleBelowFlag.bind(this);
    this.changeAllFlag = this.changeAllFlag.bind(this);
    this.dealStepData = {};
  }
  async getDealStepInfo() {
    try {
      const dealID = utils.getQueryVariable('deal_id')

      this.dealStepData = await request.getDealStepInfo({}, dealID)

      // 线上数据
      this.setState({
        packages: this.dealStepData.packages,
        questions: this.dealStepData.questions,
        promotionList: this.dealStepData.promotions,
        // confirmation info 需要的数据都在 confirmInfo 对象中
        // confirmInfo: {
        //   optIn: this.dealStepData.optIn,
        // }
      })
      this.handleConfirmInfo('optIn', this.dealStepData.optIn)
      this.handleConfirmInfo('dealId', this.dealStepData.dealId)
    } catch (e) {
      console.log(e)
    }
  }

  componentDidMount(){
    // 本地数据
    fetch('../localData/dealStepTwo.json')
    .then(res => res.json())
    .then( data => {
      this.setState({
        packages: data.packages,
        questions: data.questions,
        promotionList: data.promotions,
        // confirmation info 需要的数据都在 confirmInfo 对象中
        confirmInfo: {
          optIn: data.optIn,
        }
      })}
    )

    // this.getDealStepInfo()
  }

  //暫時沒用
  handlePackageid(packageid){
    this.setState({
      packageid: packageid
    })
  }

  //接收子組件傳來的年月日
  handleSelectedDate(date,passtime){
    this.setState({
      selectedDate: date
    });
    this.handleConfirmInfo('passtime', passtime)
  }
  //子(datepicker)传父获取timeslotId 同時也接收子組件傳來的時分秒
  handleTimeslotId(id, time){
    this.handleConfirmInfo('passtime', time);
    this.setState({
      timeslotId: id
    })
    const tmpConfirmInfo = this.state.confirmInfo
    tmpConfirmInfo.timeslotId = id
    this.setState({
      confirmInfo: tmpConfirmInfo
    })
  }

  // 获取 questionList answers
  handleConfirmInfo = (key, value) => {
    const tmpConfirmInfo = this.state.confirmInfo
    tmpConfirmInfo[key] = value
    this.setState({
      confirmInfo: tmpConfirmInfo
    })
    if (key === 'packageInfo') {
      this.setState({
        packageid: value.id
      })
    }
  }

  //接收子传父的peopleandprice
  peopleandPrice(pp){
    // this.state.peopleandPrice = pp;
    this.setState({peopleandPrice: pp, quantityContral: pp.number});
    let peopleAndPrice = []
    setTimeout(() => {
      for (let i = 0; i < pp.number.length; i++) {
        peopleAndPrice.push({
          title: pp.title[i],
          price: pp.price[i],
          count: pp.number[i],
          id: pp.id[i],
        })
      }
      this.handleConfirmInfo('priceInfo', peopleAndPrice)
    }, 0)
  }

  //接收promotion里的title
  handlePromotionTitle(promotionTitle){
    this.setState({promotionTitle: promotionTitle},function(){
      console.log(this.state.promotionTitle, 233333);
    });
  }

  //接收bottombutton传过来的值 用于显示userinformation questionlist promotion list
  handleNext(flag){
    this.setState({
      nextstate: flag
    })
  }

  handleFirstConfirm(index,flag){
    this.setState({
      afterFirstConfirm: flag
    });
    //接收点击apply remove 传过来的false
    if(flag == false){
      console.log(this.state.confirmInfo);
      const tmpConfirmInfo = this.state.confirmInfo;
      tmpConfirmInfo[index]= 'buttonTextone';
      this.setState({
        confirmInfo: tmpConfirmInfo
      })
    }
  }
  //日期和quantity 控制下面模块显示（两者共用）
  handleBelowFlag(flagone, flagtwo,index){
    // this.setState({nextstate: one, afterFirstConfirm: two})
    const tmpConfirmInfo = this.state.confirmInfo;
      tmpConfirmInfo[index]= 'buttonTexttwo';
      this.setState({
        confirmInfo: tmpConfirmInfo,
        nextstate: flagone,
        afterFirstConfirm: flagtwo
      })
  }

  changeAllFlag(bool,num,index){
    const tmpConfirmInfo = this.state.confirmInfo;
    tmpConfirmInfo[index]= 'buttonTextthree';
    this.setState({
      confirmInfo: tmpConfirmInfo,
      nextstate: bool,
      afterFirstConfirm: bool,
      quantityDisplay: bool,
      selectIdPackageDateLengthTwo: num,
      controlQuantity: false,
      quantityContral: undefined  //防止NEXT高亮
    },function(){
      this.setState({controlQuantity: true})
    });
    // this.selectPackage();
  }

  selectPackage(){
    let that = this;
    if(this.state.packages !== undefined){
      this.state.selectIdPackage = this.state.packages.find(function(ele){
        return ele.id === that.state.packageid;
      });
      if(this.state.selectIdPackage !== undefined){
        if(this.state.selectIdPackage.dates.length>0){
          this.state.selectIdPackageDateLength = this.state.selectIdPackage.dates.length;
          this.state.selectIdPackageDateLengthTwo = this.state.selectIdPackage.dates.length;
          for(let i =0; i<this.state.selectIdPackage.dates.length; i++){
            if(this.state.selectedDate === this.state.selectIdPackage.dates[i].date.substring(8,10)){
              this.state.dealitemTypes = this.state.selectIdPackage.dates[i].dealItemTypes;
            }
          }
        }else{
              this.state.selectIdPackageDateLength = 0;
              this.state.selectIdPackageDateLengthTwo = 0;
              this.state.dealitemTypes = this.state.selectIdPackage.dealItemTypes;
        }
      }    
    }  
  }
  render() {
    let that = this;
    let selectIdPackage;
    let dealitemTypes;
    // let quantityDisplay;
    let selectIdPackageDateLength; //通过判断date.length判断日期的显示
    // let selectIdPackageDateLengthTwo; //通过判断date.length判断日期的显示
    let promotionList = [];
    //判断quantity显现
    if(this.state.timeslotId){ 
      this.state.quantityDisplay = true;
      this.state.timeslotId = false;  //防止再点击package的时候显示quantity
    }
    // console.log(this.state.timeslotId);
    //父组件传select quantity子组件 dealitemTypes属性；
    // if(this.state.packages !== undefined){  
    //    selectIdPackage = this.state.packages.find(function(ele){
    //     return ele.id === that.state.packageid;
    //   })
    //   if(selectIdPackage !== undefined){
    //     if(selectIdPackage.dates.length>0){
    //       selectIdPackageDateLength = selectIdPackage.dates.length;
    //       this.state.selectIdPackageDateLengthTwo = selectIdPackage.dates.length;      
    //       for(let i =0; i<selectIdPackage.dates.length; i++){
    //         if(this.state.selectedDate === selectIdPackage.dates[i].date.substring(8,10)){
    //           dealitemTypes = selectIdPackage.dates[i].dealItemTypes;
    //         }
    //       }
    //     }else{
    //       selectIdPackageDateLength = 0;
    //       this.state.selectIdPackageDateLengthTwo = 0;
    //       dealitemTypes = selectIdPackage.dealItemTypes;
    //     }  
    //   }     
    // }

    this.selectPackage();
    
    if(this.state.promotionList !== undefined){
      promotionList = this.state.promotionList;
    }
    
    return (
      <div>
        {/* <SelectPackage /> */}
        <PackageRadio packages={this.state.packages} getPackageInfo={this.handleConfirmInfo} onChangeAllFlag={this.changeAllFlag} belowFlagOne={this.state.nextstate} belowFlagTwo={this.state.afterFirstConfirm} selectIdPackageDateLengthTwo={this.state.selectIdPackageDateLengthTwo} quantityDisplay={this.state.quantityDisplay}/>
        {/* <SelectTime /> */}
        {this.state.selectIdPackageDateLength>0 && <DatePicker packages={this.state.selectIdPackage} onChangeHandledates={this.handleSelectedDate} onChangeTimeslotId={this.handleTimeslotId} onHandleBelowFlag={this.handleBelowFlag} belowFlagOne={this.state.nextstate} belowFlagTwo={this.state.afterFirstConfirm}/>}      
        {(this.state.quantityDisplay || (this.state.selectIdPackageDateLengthTwo ==0 && this.state.controlQuantity)) && <Quantity dealitemTypes={this.state.dealitemTypes} timeslotId={this.state.timeslotId} handlepeopleandPrice={this.peopleandPrice} onHandleBelowFlag={this.handleBelowFlag} belowFlagOne={this.state.nextstate} belowFlagTwo={this.state.afterFirstConfirm}/>}
        {this.state.nextstate && <Userdetails getUserInfo={this.handleConfirmInfo}/>}
        {this.state.nextstate && this.state.questions &&
          <QuestionList
            questions={ this.state.questions }
            timeslotId={ this.state.timeslotId }
            packageId={ this.state.packageid }
            getQuestionListAnswers={this.handleConfirmInfo}/>
        }
        {this.state.nextstate && <Promotionlist promotionList={promotionList} peopleandprice={this.state.peopleandPrice} onHandlePromotionTitle={this.handleConfirmInfo} onHandleConfirmAppear={this.handleFirstConfirm} confirmAppear={this.state.afterFirstConfirm}/>}
        {this.state.afterFirstConfirm && <Confirmation confirmInfo={this.state.confirmInfo} getCheckedInfo={this.handleConfirmInfo}/>}
        <BottomButton quantityContral={this.state.quantityContral} onHandleNext={this.handleNext} onHandleFirstConfirm={this.handleFirstConfirm} verifyUserInf={this.state.confirmInfo}/>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default App;
