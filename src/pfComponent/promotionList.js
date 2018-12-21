import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import '../App.css';

class Promotionlist extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.peopleandprice);
    this.state = {
      open: false,
      promotionList: [],
      title: '',
      message: '',
      peopleandprice: {},
      usediscountedPrice: [],
      totalNo: 0,
      promotionTitle: ''
    };
    this.handleApplyorNot = this.handleApplyorNot.bind(this);
    this.promotionItem = {}
  }


  handleClickOpen = (title, message, e) => {
    this.setState({
      open: true,
      title: title,
      message: message
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  componentWillReceiveProps(nextProps) {
    this.state.promotionList = nextProps.promotionList;
    if (nextProps.peopleandprice != undefined) {
      let totalnum = 0;
      this.state.peopleandprice = nextProps.peopleandprice;
      for (let i = 0; i < this.state.peopleandprice.number.length; i++) {
        this.state.usediscountedPrice[i] = false;
        totalnum += this.state.peopleandprice.number[i] * this.state.peopleandprice.price[i];
      }
      this.setState({ totalNo: totalnum })
    }
  }

  //promotionlist 里面只能选择一个折扣价
  useApplyOnce(index){
    if (this.state.usediscountedPrice[index] == true) {
      let temp = { ...this.state.usediscountedPrice, [index]: !this.state.usediscountedPrice[index] }
      this.setState({
        usediscountedPrice: temp
      });
      this.state.promotionTitle = '';  //改状态下传空值
    } else {
      for (let j = 0; j < this.state.promotionList.length; j++) {
        this.state.usediscountedPrice[j] = false;
      }
      let temp = { ...this.state.usediscountedPrice, [index]: !this.state.usediscountedPrice[index] }
      this.setState({
        usediscountedPrice: temp
      });
      this.state.promotionTitle = this.state.promotionList[index].title;
      this.promotionItem.id = this.state.promotionList[index].id;
      this.promotionItem.title = this.state.promotionList[index].title;
      this.promotionItem.value = this.state.promotionList[index].value;
      this.promotionItem.ratio = this.promotionItem.value;
    }
  }
  handleApplyorNot(index, e) {
    if (!this.state.promotionList[index].conditions) {
      this.useApplyOnce(index);
      this.props.onHandlePromotionTitle('promotionItem', this.promotionItem);
       //点击apply remove时 通过判断confirmation 是否为true 来隐藏它
       if(this.props.confirmAppear){
        this.props.onHandleConfirmAppear('buttonText',false);
      }
    } else {
      if (this.state.totalNo > this.state.promotionList[index].conditions.price_total.minimum) {
        this.useApplyOnce(index);
        this.props.onHandlePromotionTitle('promotionItem', this.promotionItem);
        //点击apply remove时 通过判断confirmation 是否为true 来隐藏它
        if(this.props.confirmAppear){
          this.props.onHandleConfirmAppear('buttonText',false);
        }
      }
    }

  }

  render() {
    console.log(this.state.peopleandprice);
    let that = this;
    let promotionList = this.state.promotionList;
    return (
      <div>
        {promotionList.map(function (ele, index) {
          return (
            <div style={{ overflow: 'hidden' }} key={index}>
              <Button style={{ color: '#ff8400' }} onClick={that.handleClickOpen.bind(this, ele.title, ele.message)}>{ele.title}</Button>
              <Button style={{ color: '#ff8400', float: 'right' }} onClick={that.handleApplyorNot.bind(this, index)}>{that.state.usediscountedPrice[index] ? 'REMOVE' : 'APPLY'}</Button>
            </div>
          );
        })}
        <Dialog
          open={that.state.open}
          onClose={that.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{that.state.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {that.state.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={that.handleClose} color="primary" autoFocus>
              OK
          </Button>
          </DialogActions>
        </Dialog>
      </div>


    );
  }
}

export default Promotionlist;
