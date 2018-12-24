import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import request from '../api/request';
import { monthDict } from '../dict/bottomButton'

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
    payNowBtn: {
        display: 'inline-flex',
        backgroundColor: '#ff8400',
        width: '100%',
        color: '#fff',
        boxShadow: 'none',
        borderRadius: '4px',
        textTransform: 'uppercase',
        alignItems: 'center',
        verticalAlign: 'middle',
        justifyContent: 'center',
        margin: '8px',
        textDecoration: 'none',
        minHeight: '36px',
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
    }
});

class BottomButton extends React.Component{
    constructor(props){
        super(props);
        this.state={
            bottonButtonText: 'NEXT',
            sum: 0, //总数量>0  button就高亮
            userInf: {},
            email: '',
            open: false,
            vertical: 'bottom',
            horizontal: 'center',
            confirmInfo: '',
            warnmessage: ''

        }
        this.handleBottomButton = this.handleBottomButton.bind(this);
        this.confirmBodyPar = {};
        this.chooseDate = '';
    }
    
    componentWillReceiveProps(nextProps){
        this.setState({userInf: nextProps.verifyUserInf});
        //接收父组件buttonText重新点击apply remove 来显示下面模块
        if(this.state.userInf.buttonText == 'buttonTextone'){
            this.setState({bottonButtonText : 'CONFIRM',sum: 1});
            // this.state.sum = 0;
        };
        if(this.state.userInf.buttonText == 'buttonTexttwo'){      //接收父组件的buttonText重新点击quantity 来显示下面模块
            this.setState({bottonButtonText : 'NEXT',sum: 1});
            this.state.userInf.buttonText = ''; //清空， 防止其他点击时 又执行这一步；  巨坑
            // this.state.sum = 0;
        }
        if(this.state.userInf.buttonText == 'buttonTextthree'){      //接收父组件的buttonText重新点击select quantity 来显示下面模块
            this.setState({bottonButtonText : 'NEXT', sum: 0});
            this.state.userInf.buttonText = ''; //清空， 防止其他点击时 又执行这一步；  巨坑
            document.getElementById('bottomButton').setAttribute('disabled', 'true')
        }
        
        
        //判断是否打钩协议
        if(this.state.userInf.checkedInfo){
            if(this.state.userInf.checkedInfo.terms){
                this.setState({bottonButtonText : 'PAY NOW'})
                
                this.confirmBodyPar.optIn = this.props.verifyUserInf.optIn.isRender
                console.log(this.confirmBodyPar)
                Object.keys(this.confirmBodyPar).forEach(key => {
                    if (!this.confirmBodyPar[key]) {
                        delete this.confirmBodyPar[key]
                    }
                })
                console.log(this.confirmBodyPar)
                this.iLink = `dealpaymentoptions:${JSON.stringify(this.confirmBodyPar)}`
                this.state.userInf.checkedInfo = undefined; //防止将上面的点击apply remove时的buttontext覆盖；
            }else{
                this.setState({bottonButtonText : 'CONFIRM',sum: 0}); 
                // this.state.userInf.checkedInfo.terms = false;
                this.state.userInf.checkedInfo = undefined; //防止将上面的点击apply remove时的buttontext覆盖；
            }
            
        }
        if(nextProps.quantityContral != undefined){
            let total = 0;
            for(let i = 0; i<nextProps.quantityContral.length; i++){
                total += nextProps.quantityContral[i];
            }
            this.setState({sum: total});
        };
        
        
        
    }

    handleClick(){
        this.setState({ open: true});
      };
    
    handleClose = () => {
        this.setState({ open: false });
      };

    async handleBottomButton(e){ 
        if(e.currentTarget.getAttribute('buttontext') == 'NEXT'){
            this.props.onHandleNext(true);
            this.setState({bottonButtonText: 'CONFIRM'})
        }else if(e.currentTarget.getAttribute('buttontext') == 'CONFIRM'){
            let questionFlag = true;
            let emailFlag;
            let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{1,4})$/;
            //判断question是否填信息
            if(this.state.userInf.answers){
                Object.keys(this.state.userInf.answers).forEach((key) => {
                    if(this.state.userInf.answers[key].value.length == 0){
                        questionFlag = false;
                    }
                })
            }
            //判断邮箱格式是否正确
            if(this.state.userInf.userInfo != undefined){
                if(this.state.userInf.userInfo.email != undefined){
                    if(reg.test(this.state.userInf.userInfo.email)){
                                emailFlag = true;
                    }
                }
            }
            
            try {
                //所有验证通过向后台发送数据
                if(questionFlag && emailFlag && this.state.userInf.userInfo.firstName && this.state.userInf.userInfo.lastName){
                    // 验证通过发给后台校验
                const quantities = {}
                this.props.verifyUserInf.priceInfo.forEach(item => {
                    quantities[item.id] = item.count
                })
                if (this.props.verifyUserInf.passtime) {
                    const chooseMonth = monthDict.filter(item => {
                        return item.value === this.props.verifyUserInf.passtime.month
                    })
                    this.chooseDate = `${chooseMonth[0].label} ${this.props.verifyUserInf.passtime.date}, ${this.props.verifyUserInf.passtime.year} ${this.props.verifyUserInf.passtime.shifenmiao}`
                }
                this.confirmBodyPar = {
                    "answers": this.props.verifyUserInf.answers || {},
                    "date": this.chooseDate,
                    "dealId": this.props.verifyUserInf.dealId,
                    "packageId": this.props.verifyUserInf.packageInfo.id,
                    "promotionId": this.props.verifyUserInf.promotionItem ? this.props.verifyUserInf.promotionItem.id : '',
                    "quantities": quantities,
                    "timeslotId": this.props.verifyUserInf.timeslotId,
                    "userInfo": {
                        "firstName": this.props.verifyUserInf.userInfo.firstName,
                        "lastName": this.props.verifyUserInf.userInfo.lastName,
                        "email": this.props.verifyUserInf.userInfo.email,
                    }
                }
                let result = await request.confirmDealInfo(this.confirmBodyPar)
                // const result = {
                //     success: true
                // }
                if (result.success) {
                    this.props.onHandleFirstConfirm('',true);
                    this.setState({sum: 0});
                } else {
                    this.setState({
                        confirmInfo: result.message
                    })
                }
                } else {
                    if(!this.state.userInf.userInfo){
                        this.setState({warnmessage: 'Please enter passport first name.'});
                    }else if(!this.state.userInf.userInfo.firstName){
                        this.setState({warnmessage: 'Please enter passport first name.'});
                    }else if(!this.state.userInf.userInfo.lastName){
                        this.setState({warnmessage: 'Please enter passport last name.'});
                    }else if(!emailFlag){
                        this.setState({warnmessage: 'Please enter a valid email address.'});
                    }else if(!questionFlag){
                        this.setState({warnmessage: 'Please answer the question.'});
                    }
                    console.log(this.state.userInf.userInfo);
                    this.handleClick();
                    //3.5s后warnmessage消失
                    setTimeout(() => {
                        this.handleClose();
                    }, 3500);
                    this.props.onHandleFirstConfirm('',false);
                    this.setState({sum: 1});
                }
            } catch (e) {
                console.log(e)
            }
        }
        
    }
    render(){
        const { classes } = this.props;
        const { vertical, horizontal, open } = this.state;
        return (
            <div style={{paddingRight:20,paddingLeft:20,backgroundColor: '#f4f4f4',position:'fixed',bottom:0,width:'100%'}}>
                {this.state.bottonButtonText === 'PAY NOW' && <a className={classes.payNowBtn} href={this.iLink}>PAY NOW</a>}
                {this.state.bottonButtonText !== 'PAY NOW' && <Button id='bottomButton' variant="contained" buttontext={this.state.bottonButtonText} color="secondary" onClick={this.handleBottomButton} disabled={this.state.sum>0? false: true}  className={classes.button}>
                    {this.state.bottonButtonText}
                </Button>} 
                <Snackbar
                style={{marginBottom: '52px'}}
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                onClose={this.handleClose}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.warnmessage}</span>}
                />           
            </div>
        )
    }    
  
}

BottomButton.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(BottomButton);
