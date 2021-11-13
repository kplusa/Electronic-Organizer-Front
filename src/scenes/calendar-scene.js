import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {Overlay, Divider} from 'react-native-elements';
import Background from '../components/background';
import {theme} from '../themes/theme';
import {Agenda} from 'react-native-calendars';
import Input from '../components/input-text';
import Button from '../components/button';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {StartTimeValidator, EndTimeValidator} from '../helpers/date-validator';
import {EventValidator} from '../helpers/event-validator';
import SuccessfulOverlay from '../components/successful-overlay';

export default function Calendar({navigation}) {
  const [count, setCount] = useState(0);
  const currdate = new Date();
  const [currentDate, setCurrentDate] = useState(
    currdate.toISOString().split('T')[0],
  );
  const [startTime, setStartTime] = useState({value: '', error: ''});
  const [endTime, setEndTime] = useState({value: '', error: ''});
  const [visibleAddForm, setVisibleAddForm] = useState(false);
  const [visibleDeleteForm, setVisibleDeleteForm] = useState(false);
  const [visibleEditForm, setVisibleEditForm] = useState(false);
  const [event, setEvent] = useState({value: '', error: ''});

  const [isDatePickerStartTimeVisible, setDatePickerStartTimeVisibility] =
    useState(false);
  const [isDatePickerEndTimeVisible, setDatePickerEndTimeVisibility] =
    useState(false);
  const [isSuccessfulOverlayVisible, setSuccessfulOverlayVisibility] =
    useState(false);
  const onOKPressed = () => {
    const startTimeError = StartTimeValidator(startTime.value, endTime.value);
    const endTimeError = EndTimeValidator(startTime.value, endTime.value);
    const eventError = EventValidator(event.value, event.value);

    if (startTimeError || endTimeError) {
      setStartTime({...startTime, error: startTimeError});
      setEndTime({...endTime, error: endTimeError});
      setEvent({...event, error: eventError});
      return;
    }
    toggleAddFormOverlay();
    setSuccessfulOverlayVisibility(true);
    setTimeout(() => {
      setSuccessfulOverlayVisibility(false);
    }, 2000);
  };

  const toogleSuccessfulOverlay = () => {
    setSuccessfulOverlayVisibility(!isSuccessfulOverlayVisible);
  };
  const toogleStartTimePicker = () => {
    setDatePickerStartTimeVisibility(!isDatePickerStartTimeVisible);
  };
  const toogleEndTimePicker = () => {
    setDatePickerEndTimeVisibility(!isDatePickerEndTimeVisible);
  };

  const handleStartTime = date => {
    toogleStartTimePicker();

    setStartTime({
      value:
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0'),
      error: '',
    });
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
  const resetValues = () => {
    setStartTime({value: '', error: ''});
    setEndTime({value: '', error: ''});
    setEvent({value: '', error: ''});
    setSuccessfulOverlayVisibility(false);
  };
  const toggleAddFormOverlay = () => {
    resetValues();
    setVisibleAddForm(!visibleAddForm);
  };
  const toggleEditFormOverlay = () => {
    setVisibleEditForm(!visibleEditForm);
  };
  const toggleDeleteFormOverlay = () => {
    setVisibleDeleteForm(!visibleDeleteForm);
  };

  const timeToString = time => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={styles.headerButtons}
            onPress={toggleAddFormOverlay}>
            <Icon name={'plus-circle'} size={25} color="white"></Icon>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButtons}
            onPress={() => navigation.openDrawer()}>
            <Icon name={'edit'} size={25} color="white"></Icon>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButtons}
            onPress={() => navigation.openDrawer()}>
            <Icon name={'trash'} size={25} color="white"></Icon>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const [items, setItems] = useState({});

  const loadItems = day => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
            });
          }
        }
      }
      const newItems = {};
      Object.keys(items).forEach(key => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };

  return (
    <View style={{flex: 1}}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={currentDate}
        onDayPress={day => {
          setCurrentDate(day.dateString);
        }}
      />

      <Overlay
        isVisible={visibleAddForm}
        onBackdropPress={toggleAddFormOverlay}>
        <View style={{alignSelf: 'center'}}>
          <MaterialIcon
            name={'event'}
            size={40}
            color={theme.colors.mainColor}></MaterialIcon>
        </View>
        <Input
          style={{height: 50, width: '80%'}}
          inputContainerStyle={{
            height: 50,
            width: '80%',
            alignSelf: 'center',
          }}
          disabled
          label="Selected date"
          value={currentDate}
          leftIcon={{type: 'material-icons', name: 'today', size: 15}}
          blurOnSubmit={false}
          forwardRef={true}></Input>
        <KeyboardAvoidingView style={{width: '80%', flexDirection: 'row'}} behavior="height">
          <Input
            style={{height: 50, width: '100%'}}
            inputContainerStyle={{
              height: 50,
              width: '100%',
              alignSelf: 'center',
            }}
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
            leftIcon={{type: 'material-icons', name: 'access-time', size: 15}}
            blurOnSubmit={false}
            forwardRef={true}></Input>

          <TouchableOpacity
            style={{color: theme.colors.mainColor, justifyContent: 'center'}}
            onPress={toogleStartTimePicker}>
            <MaterialIcon
              name={'timer'}
              size={25}
              color={theme.colors.mainColor}></MaterialIcon>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerStartTimeVisible}
            mode="time"
            is24Hour={true}
            onConfirm={handleStartTime}
            onCancel={toogleStartTimePicker}
            date={new Date()}
          />
        </KeyboardAvoidingView>

        <KeyboardAvoidingView style={{width: '80%', flexDirection: 'row'}} behavior="height">
          <Input
            style={{height: 50, width: '100%'}}
            inputContainerStyle={{
              height: 50,
              width: '100%',
              alignSelf: 'center',
            }}
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
            leftIcon={{type: 'material-icons', name: 'access-time', size: 15}}
            blurOnSubmit={false}
            forwardRef={true}></Input>
          <TouchableOpacity
            style={{color: theme.colors.mainColor, justifyContent: 'center'}}
            onPress={toogleEndTimePicker}>
            <MaterialIcon
              name={'timer'}
              size={25}
              color={theme.colors.mainColor}></MaterialIcon>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerEndTimeVisible}
            mode="time"
            is24Hour={true}
            onConfirm={handleEndTime}
            onCancel={toogleEndTimePicker}
            date={new Date()}
          />
        </KeyboardAvoidingView>
        <KeyboardAvoidingView style={{width: '100%'}} behavior="height">
          <Input
            style={{height: 50, width: '80%'}}
            inputContainerStyle={{
              height: 50,
              width: '80%',
              alignSelf: 'center',
            }}
            placeholder="Enter the event you want to add"
            returnKeyType="next"
            value={event.value}
            onChangeText={text => setEvent({value: text})}
            error={!!event.error}
            errorMessage={event.error}
            autoCapitalize="none"
            autoCompleteType="off"
            errorStyle={{color: theme.colors.error}}
            leftIcon={{type: 'material-icons', name: 'event-note', size: 15}}
            blurOnSubmit={false}
            forwardRef={true}></Input>
        </KeyboardAvoidingView>
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
            onPress={toggleAddFormOverlay}
          />
        </View>
      </Overlay>

      {isSuccessfulOverlayVisible ? <SuccessfulOverlay /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.mainColor,
  },
  headerButtons: {
    width: 30,
    height: 35,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});
