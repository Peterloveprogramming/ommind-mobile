import { View,StyleSheet,Image,Text,Platform} from "react-native";
import { images } from "@/constants/images";


const LhamoHeader = () => {
    return ( 
    <View style={styles.headerParent}>
      <View style={styles.lhamoHeaderContainer}>
        <Image source={images.lhamo_mini} />
        <Text style={{color:"#FFFFFF"}}>Lhamo</Text>
      </View>
    </View>
    )
}

export default LhamoHeader;


const styles = StyleSheet.create({
  headerParent:{
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    width:"100%",
    justifyContent:"center",
    alignItems:"center",
  },
  lhamoHeaderContainer: {
    // borderWidth:3,
    width:135,
    height:40,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:50,
    backgroundColor: 'rgba(71, 71, 71, 0.5)', 
    gap:5,
  },
})