import React, {useEffect, useState, ChangeEvent, FormEvent} from "react"
import "./styles.css"
import { Link, useHistory} from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import logo from "../../assets/logo.svg"
import { Map, TileLayer, Marker} from "react-leaflet"
import api from "../../services/api"
import axios from "axios"
import { LeafletMouseEvent } from "leaflet"

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState("0")
    const [cities, setCities] = useState<string[]>([])
    const [selectedCity, setSelectedCity] = useState("0")
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [InitialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: "",
    })
    const [selectedItems, setSelectedItems] = useState<number[]>([])
        //array ou objeto: manualmente informar o tipo da variavel

    const history = useHistory()

    interface Item{
        id: number,
        title:string,
        image_url:string
    }

    interface IBGEUFResponse {
        sigla: string
    }

    interface IBGECityResponse{
        nome: string
    }

    useEffect(() => {
        api.get("items")
        .then(response => 
            setItems(response.data))
    }, [])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        .then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        if(selectedUf === "0"){
            return
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then( response => {
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames)
        })

    }, [selectedUf]) //carregar sempre q a uf mudar

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    }, [])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value
        setSelectedUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target

        setFormData({...formData, [name]: value})
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item == id)

        if(alreadySelected >= 0){
            const fileredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(fileredItems)
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()
        
        const {name, email, whatsapp} = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        console.log(data)
        await api.post("points", data)

        alert("Ponto de Coleta Salvo")

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br/>ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>


                    <div className="field">
                            <label htmlFor="name">Nome da entidade</label>
                            <input type="text" onChange={handleInputChange} name="name" id="name"/>
                        </div>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email"  onChange={handleInputChange} name="email" id="email"/>
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text"  onChange={handleInputChange} name="whatsapp" id="whatsapp"/>
                        </div>

                    </div>
                
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={InitialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">

                    <div className="field">
                        <label htmlFor="uf">Estado(UF)</label>
                        <select onChange={handleSelectUf} value={selectedUf} name="uf" id="uf">
                            <option value="0">Selecione uma UF</option>
                            {ufs.map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select onChange={handleSelectCity} name="city" id="city">
                            <option value="0">Selecione uma Cidade</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option> )}
                        </select>
                    </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                    {items.map(item => (
                        <li key={item.id} className={selectedItems.includes(item.id) ? "selected" : ""} onClick={() => handleSelectItem(item.id)}>
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                    ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
                
            </form>

        </div>
    )
}

export default CreatePoint