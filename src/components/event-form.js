import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {Overlay, Divider} from 'react-native-elements';
import {theme} from '../themes/theme';
import Input from '../components/input-text';
import Button from '../components/button';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {StartTimeValidator, EndTimeValidator} from '../helpers/date-validator';
import {EventValidator} from '../helpers/event-validator';
import SuccessfulOverlay from '../components/successful-overlay';
import SearchServices from '../components/search-services';
import axios from 'axios';
import {config} from '../configs/config';
import {StoreData, GetData} from '../helpers/store-data';

export default function EventForm({
  visibleEventForm,
  toogleEventForm,
  item,
  onlyAddHeaderOption,
  formType,
  currentDate,
  getEvent,
  loadItems,
  reloadAgenda,
}) {
  const [startTime, setStartTime] = useState({
    value: '',
    error: '',
  });
  const [startTimeFocused, setStartTimeFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [endTime, setEndTime] = useState({value: '', error: ''});
  const [event, setEvent] = useState({value: '', error: ''});
  const [endTimeCount, setEndTimeCount] = useState(false);
  const _startTime = new Date(item.start_time);
  const _endTime = new Date(item.end_time);
  const SetTitleFocused = state => {
    if (state === 'focus') setTitleFocused(true);
    else setTitleFocused(false);
  };

  const getEndTime = data => {
    GetData('token').then(token => {
      GetData('email').then(mail => {
        axios
          .post(
            `${config.api_url}/Events/count-time`,
            {
              userMail: mail,
              title: event.value,
              startTime:
                formType === 'add'
                  ? new Date(
                      new Date(currentDate + ' ' + data.value).getTime() +
                        60 * 60 * 1000,
                    )
                  : new Date(
                      new Date(item.day + ' ' + data.value).getTime() +
                        60 * 60 * 1000,
                    ),
            },
            {headers: {Authorization: `Bearer ${token}`}},
          )
          .then(response => {
            if (response.status !== 204) {
              setEndTime({value: response.data.data, error: ''});
            }
          })
          .catch(error => {
            console.log(error);
          });
      });
    });
  };

  useEffect(() => {
    if (formType !== 'add') {
      setStartTime({
        value:
          String(_startTime.getHours()).padStart(2, '0') +
          ':' +
          String(_startTime.getMinutes()).padStart(2, '0'),
        error: '',
      });
      setEvent({
        value: item.name !== undefined ? item.name : item.title,
        error: '',
      });
      setEndTime({
        value:
          String(_endTime.getHours()).padStart(2, '0') +
          ':' +
          String(_endTime.getMinutes()).padStart(2, '0'),
        error: '',
      });
    } else {
      setStartTime({
        value: '',
        error: '',
      });
      setEvent({value: '', error: ''});
      setEndTime({
        value: '',
        error: '',
      });
    }
  }, [visibleEventForm]);

  const [isDatePickerStartTimeVisible, setDatePickerStartTimeVisibility] =
    useState(false);
  const [isDatePickerEndTimeVisible, setDatePickerEndTimeVisibility] =
    useState(false);

  const [isSuccessfulOverlayVisible, setSuccessfulOverlayVisibility] =
    useState(false);
  const toogleStartTimePicker = () => {
    setDatePickerStartTimeVisibility(!isDatePickerStartTimeVisible);
  };
  const toogleEndTimePicker = () => {
    setDatePickerEndTimeVisibility(!isDatePickerEndTimeVisible);
  };
  const handleStartTime = date => {
    toogleStartTimePicker();
    data = {
      value:
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0'),
      error: '',
    };
    setStartTime(data);
    action(data);
  };

  const handleEndTime = date => {
    toogleEndTimePicker();
    setEndTime({
      value:
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0'),
      error: '',
    });
  };

  const SetEvent = childData => {
    setEvent(childData);
  };

  const onOKPressed = () => {
    const startTimeError = StartTimeValidator(startTime.value, endTime.value);
    const endTimeError = EndTimeValidator(startTime.value, endTime.value);
    const eventError = EventValidator(event.value, event.value);

    if (startTimeError || endTimeError || eventError) {
      setStartTime({...startTime, error: startTimeError});
      setEndTime({...endTime, error: endTimeError});
      setEvent({...event, error: eventError});
      return;
    }
    GetData('token').then(token => {
      GetData('email').then(mail => {
        if (formType === 'add') {
          axios
            .post(
              `${config.api_url}/Events`,
              {
                title: event.value,
                date: new Date(currentDate),
                startTime: new Date(
                  new Date(currentDate + ' ' + startTime.value).getTime() +
                    60 * 60 * 1000,
                ),
                endTime: new Date(
                  new Date(currentDate + ' ' + endTime.value).getTime() +
                    60 * 60 * 1000,
                ),
                userMail: mail,
              },
              {headers: {Authorization: `Bearer ${token}`}},
            )
            .then(response => {
              if (response.data.status === 'Success') {
                resposeBehaviour();
              }
            })
            .catch(error => {
              errorBehaviour(error);
            });
        }
        if (formType === 'edit') {
          axios
            .put(
              `${config.api_url}/Events`,
              {
                title: event.value,
                date: new Date(currentDate),
                startTime: new Date(
                  new Date(currentDate + ' ' + startTime.value).getTime() +
                    60 * 60 * 1000,
                ),
                endTime: new Date(
                  new Date(currentDate + ' ' + endTime.value).getTime() +
                    60 * 60 * 1000,
                ),
                userMail: mail,
                id: item.id,
              },
              {
                headers: {Authorization: `Bearer ${token}`},
              },
            )
            .then(response => {
              if (response.data.status === 'Success') {
                resposeBehaviour();
              }
            })
            .catch(error => {
              errorBehaviour(error);
            });
        }
        if (formType === 'delete') {
          axios
            .delete(`${config.api_url}/Events/${item.id}`, {
              headers: {Authorization: `Bearer ${token}`},
            })
            .then(response => {
              if (response.status === 204) {
                resposeBehaviour();
              }
            })
            .catch(error => {
              console.log(error);
              errorBehaviour(error);
            });
        }
      });
    });
  };

  const resposeBehaviour = () => {
    toogleEventForm();
    setSuccessfulOverlayVisibility(true);
    setTimeout(() => {
      resetValues();
      reloadAgenda();
    }, 1000);
  };
  const errorBehaviour = error => {
    if (!error.response) {
      setEndTime({...endTime, error: 'Network error.'});
    } else {
      if (error.response.data) {
        setEndTime({...endTime, error: error.response.data.message});
      }
    }
    return;
  };

  const resetValues = () => {
    setSuccessfulOverlayVisibility(false);
    onlyAddHeaderOption();
  };

  const action = data => {
    let dataTime = {};
    if (data !== undefined) {
      dataTime = data;
    } else {
      dataTime = startTime;
    }
    if (
      event.value !== '' &&
      dataTime.value !== '' &&
      startTimeFocused === false
    )
      getEndTime(dataTime);
  };
  return (
    <>
      <Overlay
        isVisible={visibleEventForm}
        onBackdropPress={toogleEventForm}
        overlayStyle={{height: '80%'}}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{width: '85%'}}>
          <View style={{alignSelf: 'center'}}>
            <MaterialIcon
              name={
                formType === 'add'
                  ? 'event'
                  : formType === 'edit'
                  ? 'edit'
                  : 'delete'
              }
              size={40}
              color={theme.colors.mainColor}></MaterialIcon>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Input
              style={styles.inputStyle}
              inputContainerStyle={styles.inputContainerStyle}
              disabled
              label={
                formType === 'add'
                  ? 'Selected date'
                  : formType === 'edit'
                  ? 'Day of the editing event'
                  : 'Day of the deleting event'
              }
              value={formType === 'add' ? currentDate : item.day}
              leftIcon={{type: 'material-icons', name: 'today', size: 15}}
              blurOnSubmit={false}
              forwardRef={true}></Input>
          </View>
          <SearchServices
            setEvent={SetEvent}
            event={event}
            disable={formType === 'delete' ? true : false}
            setTitleFocused={SetTitleFocused}
            action={action}
          />
          <View style={{flexDirection: 'row'}} behavior="height">
            <Input
              style={styles.inputStyle}
              onBlur={() => {
                action(startTime);
              }}
              inputContainerStyle={styles.inputContainerStyle}
              label="Start time"
              placeholder="Enter the time"
              returnKeyType="next"
              value={startTime.value}
              onChangeText={text => setStartTime({value: text, error: ''})}
              error={!!startTime.error}
              errorMessage={startTime.error}
              autoCapitalize="none"
              autoCompleteType="off"
              errorStyle={{color: theme.colors.error}}
              leftIcon={{
                type: 'material-icons',
                name: 'access-time',
                size: 15,
              }}
              rightIcon={
                formType === 'delete'
                  ? null
                  : {
                      type: 'material-icons',
                      name: 'timer',
                      size: 25,
                      color: theme.colors.mainColor,
                      onPress: toogleStartTimePicker,
                    }
              }
              disabled={formType === 'delete' ? true : false}
              blurOnSubmit={false}
              forwardRef={true}></Input>
            <DateTimePickerModal
              isVisible={isDatePickerStartTimeVisible}
              mode="time"
              is24Hour={true}
              onConfirm={handleStartTime}
              onCancel={toogleStartTimePicker}
              date={new Date()}
            />
          </View>

          <View style={{flexDirection: 'row'}} behavior="height">
            <Input
              style={styles.inputStyle}
              inputContainerStyle={styles.inputContainerStyle}
              label="End time"
              placeholder="Enter the time"
              returnKeyType="next"
              value={endTime.value}
              onChangeText={text => setEndTime({value: text, error: ''})}
              error={!!endTime.error}
              errorMessage={endTime.error}
              autoCapitalize="none"
              autoCompleteType="off"
              errorStyle={{color: theme.colors.error}}
              leftIcon={{
                type: 'material-icons',
                name: 'access-time',
                size: 15,
              }}
              disabled={formType === 'delete' ? true : false}
              blurOnSubmit={false}
              rightIcon={
                formType === 'delete'
                  ? null
                  : {
                      type: 'material-icons',
                      name: 'timer',
                      size: 25,
                      color: theme.colors.mainColor,
                      onPress: toogleEndTimePicker,
                    }
              }
              forwardRef={true}></Input>
            {formType === 'delete' ? null : (
              <DateTimePickerModal
                isVisible={isDatePickerEndTimeVisible}
                mode="time"
                is24Hour={true}
                onConfirm={handleEndTime}
                onCancel={toogleEndTimePicker}
                date={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <Button
              style={styles.overlayButton}
              titleStyle={{
                fontSize: 16,
                lineHeight: 16,
              }}
              title="OK"
              onPress={onOKPressed}
            />
            <View style={styles.overlayDivider}></View>
            <Button
              style={styles.overlayButton}
              titleStyle={{
                fontSize: 16,
                lineHeight: 16,
              }}
              title="Cancel"
              onPress={() => {
                toogleEventForm();
                resetValues();
              }}
            />
          </View>
        </ScrollView>
      </Overlay>
      {isSuccessfulOverlayVisible ? <SuccessfulOverlay /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  overlayText: {
    fontSize: 16,
    margin: 10,
    fontWeight: 'bold',
    color: theme.colors.thirdColor,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    justifyContent: 'center',
  },
  overlayButton: {
    width: 100,
    backgroundColor: theme.colors.mainColor,
  },
  overlayDivider: {
    margin: 5,
  },
  inputStyle: {},
  inputContainerStyle: {
    height: 50,
    width: '100%',
    alignSelf: 'center',
  },
});