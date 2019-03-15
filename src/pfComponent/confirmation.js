import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import Slide from '@material-ui/core/Slide';

import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    promotionInfo: {
      color: '#ff8400',
      paddingTop: 10,
      fontSize: 16,
    },
    promotionInfoRight: {
      color: '#ff8400',
      float: 'right',
      paddingRight: '4%',
      whiteSpace: 'nowrap',
      fontSize: 16,
    },
    appBar: {
      position: 'relative',
      color: '#000',
      backgroundColor: '#0ff'
    },
    flex: {
      flex: 1,
    },
  });
  
  function Transition(props) {
    return <Slide direction="up" {...props} />;
  }

  class Confirmation extends React.Component {
    constructor(props) {
      super(props)
      console.log(props, 29999)
      this.state = {
        selectedIndex: 1,
        questionList: [],
        checked: [],
        open: false,
      }
    }
  
    handleToggle = value => () => {
      const { checked } = this.state;
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      this.setState({
        checked: newChecked,
      });

      const checkedInfo = {}
      newChecked.forEach(item => {
        if (item === 0) {
          checkedInfo.optIn = true
        } else if (item === 1) {
          checkedInfo.terms = true
        }else{
          checkedInfo.terms = false;
        }
      })

      this.props.getCheckedInfo('checkedInfo', checkedInfo)
    };
  
    handleListItemClick = (event, index) => {
      this.setState({ selectedIndex: index });
    };

    componentDidMount() {
      if (this.props.confirmInfo.answers) {
        let tmpQuestionList = []
        Object.keys(this.props.confirmInfo.answers).forEach(key => {
          tmpQuestionList.push(this.props.confirmInfo.answers[key])
        })
        this.setState({
          questionList: tmpQuestionList
        })
      }
    }

    handleClickOpen = event => {
      event.stopPropagation()
      this.setState({ open: true });
    };
  
    handleClose = () => {
      this.setState({ open: false });
    };
  
    render() {
      const { classes } = this.props;
      const currency = this.props.confirmInfo.packageInfo.currency
      let termsandconditions = this.props.confirmInfo.termsAndConditions;
      let totalPrice = 0
      this.props.confirmInfo.priceInfo.forEach(item => {
        totalPrice += item.count * item.price
      })
      let discountPrice = 0
      if (this.props.confirmInfo.promotionItem !== undefined) {
        if(this.props.confirmInfo.promotionItem.type == "percentage"){
          discountPrice = (totalPrice * this.props.confirmInfo.promotionItem.ratio / 100).toFixed(2)
        }else{
          discountPrice = this.props.confirmInfo.promotionItem.ratio;
        }     
      }
      const actualPayment = (totalPrice - discountPrice).toFixed(2)
  
      return (
        <div className={classes.root} style={{ maxWidth: '100%' }}>
          <div className='sectionHeader'>
            <FormattedMessage
              id='bookingorder'
              defaultMessage='YOUR BOOKING ORDER'
            />
          </div>
          <List component="nav">
            <div className='confirmName'>
              {this.props.confirmInfo.userInfo.firstName} {this.props.confirmInfo.userInfo.lastName}
            </div>
            <div className='confirmationMail'>
              {this.props.confirmInfo.userInfo.email}
            </div>
            {
              this.state.questionList.map(question => (
                <div className='confirmationQuestion1'>
                  {question.title}: {question.description}
                </div>
              ))
            }
            <Divider style={{ marginTop: 10 }} />
            <div className='confirmationPackage'>
              <FormattedMessage
                id='package'
                defaultMessage='Package'
              />
            </div>
            <div className='confirmationPackageList'>
              {this.props.confirmInfo.priceInfo.map(item => (
                <div key={item.title}>
                  <span>{item.count} × {item.title}</span><span className='confirmationPackageListRight'>{currency} {item.count * item.price}</span>
                </div>
              ))}
            </div>
            {this.props.confirmInfo.promotionItem && <div className='confirmationPackageList'>
              <span className={classes.promotionInfo}>
                {this.props.confirmInfo.promotionItem.title}</span>
              <span className={classes.promotionInfoRight}>-{currency} {discountPrice}</span>
            </div>}
          </List>
          <Divider />
          <List component="nav">
            <div className='confirmationTotalHeader'>
              <span>
                <FormattedMessage
                  id='total'
                  defaultMessage='TOTAL'
                />
              </span>
              <span className='confirmationTotalHeaderRight'>{currency} {actualPayment}</span>
            </div>
            {this.props.confirmInfo.isRender && [0].map(value => (
              <ListItem key={value} role={undefined} dense button onClick={this.handleToggle(value)}>
                <Checkbox
                  checked={this.state.checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  style={{ padding: '0 0', fontSize: '14px' }}
                  primary={<FormattedMessage
                    id='checkboxoptone'
                    defaultMessage='handy may use my email to send communications.(You may opt out at anytime'
                  />}
                />

              </ListItem>
            ))}
            {[1].map(value => (
              <div>
                <ListItem key={value} role={undefined} dense button onClick={this.handleToggle(value)}>
                  <Checkbox
                    checked={this.state.checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary={<FormattedMessage
                      id='checkboxopttwo'
                      defaultMessage='I agree to Terms and Conditions'
                    />}
                    style={{ padding: '0 0', fontSize: '14px' }}
                  />
                  <span style={{ display: 'inline-block', width: '80px' }}><a href={termsandconditions}><ErrorIcon style={{ color: "#ff8400" }} /></a></span>
                </ListItem>
              </div>
            ))}
          </List>
          {/* <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" style={{fontSize: '16px'}}>
              <FormattedMessage
                id='tandc'
                defaultMessage='Terms and Conditions'
              />
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" style={{color: '#000'}}>
                <FormattedMessage
                  id='thisistandc'
                  defaultMessage='this is Terms and Conditions'
                />               
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} style={{color: "#ff8400"}} autoFocus>
                OK
              </Button>
            </DialogActions>
          </Dialog> */}
        </div>
      );
    }
  }
  
  Confirmation.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(Confirmation);  
