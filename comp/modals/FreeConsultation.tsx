import {Text,View,Modal,Image} from 'react-native'
import React from 'react'
import {images} from "@/constants/images"
import BaseButton from '../base/BaseButton';

interface FreeConsultationProps {
    isModalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
}
const FreeConsultation = ({isModalVisible,setModalVisible}:FreeConsultationProps) => {
    return (
    <Modal
    transparent={true}
    animationType="fade"
    visible={isModalVisible}
    onRequestClose={() => setModalVisible(false)} // Good practice to allow closing
    >      
    <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent background
        }}>
    {/* This is your actual modal content container */}
    <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // White with 75% opacity
        borderRadius: 20,
        width: 357, 
        height: 340,
        alignItems:"center",
        }}
    >
        <View style={{}} >
        <Image
            resizeMode="contain"
            source={images.flower}
            style={{ width: 150, height: 51 ,marginTop:20,
            }} 
        />          
        </View>
        <View style={{width:"90%", padding:20}}>
        <Text style={{fontWeight:800,color:"#0E1921",fontSize:20}}>Congratulations</Text>
        <Text style={{fontWeight:800,color:"#0E1921",fontSize:20}}>You’ve Received 1 Free Tibetan Medicine Consultation!</Text>
        <Text style={{marginTop:10,fontFamily:'Inter',fontSize:15,color:"#6C6C6C"}}>Guided by Tibetan medical wisdom, AI consultation provides personalized diagnosis report and healing plan.</Text>
        </View>
        <View style={{flexDirection:"row",gap:5, justifyContent:"flex-end",width:"95%"}}>
            <BaseButton 
                title="Maybe Later"
                textColor='#8A8A8A'
                backgroundColor="#FFFFFF"
                onPress={() => setModalVisible(false)}
            />
            <BaseButton
                title="Start Now"
                onPress={() => setModalVisible(false)}
            />
        </View>
    </View>
    
    </View>
    </Modal>
    )
}


export default FreeConsultation

