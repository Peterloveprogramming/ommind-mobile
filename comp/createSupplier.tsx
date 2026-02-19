import React from "react"
import {View,Text,TouchableOpacity} from "react-native"
import { useSupplierApi } from "@/api/api"

export const CreateSupplier: React.FC = () => {

  const {
    createSupplier:{mutation:createSupplier,data,isLoading},
  } = useSupplierApi()

  const handleSubmit = async () => {
    await CreateSupplier({
        name:"test name",
        supplier_number:"supplier number"
    })
  }

    return (
        <View>
            <TouchableOpacity>
                <Text>Test Get Supplier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>handleSubmit}>
                <Text>Test Create Supplier</Text>
            </TouchableOpacity>
        </View>
    )
}