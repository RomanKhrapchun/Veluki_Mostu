    import React, { useContext, useMemo, useState} from 'react';
import {generateIcon, iconMap} from "../../utils/constants";
import {Link, useNavigate} from "react-router-dom";
import Expander from "../common/Expander/Expander";
import {Context} from "../../main";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";

const searchIcon = generateIcon(iconMap.search,'input-icon')
const exitIcon = generateIcon(iconMap.exit)
const Menu = ({menu, isSearch = false, activeKey, selectedKey, onClick}) => {

    const [search, setSearch] = useState('')
    const navigate = useNavigate()
    const {store} = useContext(Context)

    const showMenuItems = useMemo(() => {
        if (!search) return menu
        const result = []
        if (Array.isArray(menu)) {
            menu.map(element => element?.children?.map(items => {
                if (items?.module_name?.toLowerCase()?.includes(search)) result.push(items)
                return element;
            }))
        }
        return result
    }, [search, menu])

    const selected = useMemo(() => {
        let result = null
        if (Array.isArray(menu)) {
            for (const key in menu) {
                if (menu[key].children && menu[key].children.find(obj => obj.key === selectedKey)) {
                    result = menu[key].module_id
                    break;
                }
            }
        }
        return result
    }, [menu, selectedKey])

    return (
        <>

                <div className="header__nav-top">
                    <Link to="/profile" className="paragraph paragraph--lg header__nav-name" onClick={onClick}>
                        {store.user?.fullName}
                    </Link>
                    <Button
                        className="btn btn--secondary header__nav-exit"
                        icon={exitIcon}
                        onClick={async ()=> {
                            await store.logout()
                            navigate('/')
                        }}
                    />
                </div>
                {isSearch && (
                    <Input
                        name={"search_input"}
                        icon={searchIcon}
                        type="text"
                        value={search}
                        placeholder="Пошук меню"
                        className="header__nav-search"
                        onChange={(_, value) => setSearch(value)}
                    />
                )}
                {Array.isArray(showMenuItems) && showMenuItems.map((element, index) => {
                    return <Expander
                        label={element.module_name}
                        key={index}
                        value={element.key}
                        icon={element.icon}
                        subMenuItem={element.children}
                        onClick={onClick}
                        activeKey={activeKey}
                        selectedKey={selected === element.module_id}
                    />
                })}

        </>
    );
};

export default React.memo(Menu);