import { ClockCircleOutlined } from "@ant-design/icons";
import { AutoComplete, Col, Drawer, List, Row } from "antd";
import React, { useEffect, useState } from "react";
import GROUP_MAP from "../../../constant/group-map";
import IMap from "../../../interfaces/models/map";
import IMapState from "../../../interfaces/states/map";
import useDebounce from "../../../utils/debounce";

interface IProps {
  visible: boolean;
  map: IMapState;
  onClose: () => void;
  GetListPlaces: (
    input: string,
    type: GROUP_MAP.LIST_SUGGESTED
  ) => Promise<any>;
  AddHistory: (data: IMap, type: GROUP_MAP.HISTORY) => void;
  ClearListPlaces: (type: GROUP_MAP.LIST_SUGGESTED) => void;
  GetLangLat: (place_id: string) => Promise<any>;
  setZoom: (value: number) => void;
  setCurrentLoc: (location: { lat: number; lng: number }) => void;
}

const LocationSearchDrawer = (props: IProps) => {
  const {
    visible,
    onClose,
    map,
    GetListPlaces,
    AddHistory,
    ClearListPlaces,
    GetLangLat,
    setZoom,
    setCurrentLoc,
  } = props;
  const [options, setOptions] = useState<IMap[]>(
    map.groupedList[GROUP_MAP.LIST_SUGGESTED]?.list || []
  );
  const [search, setSearch] = useState("");
  const searchVal = useDebounce(search, 500);

  useEffect(() => {
    if (search) {
      GetListPlaces(
        (searchVal || "").toLowerCase(),
        GROUP_MAP.LIST_SUGGESTED
      ).then((res) => {
        if (res.data)
          setOptions(
            res.data.predictions.map((x: any) => {
              return { value: x.description, key: x.place_id };
            })
          );
      });
    } else if (search === "") {
      ClearListPlaces(GROUP_MAP.LIST_SUGGESTED);
      setOptions([]);
    }
  }, [searchVal]);

  return (
    <Drawer
      title={
        <AutoComplete
          options={options}
          value={search}
          className="autocomplete-textbox"
          style={{ width: "100%" }}
          allowClear
          onSearch={(searchText: string) => setSearch(searchText)}
          onSelect={(data, option) => (
            setSearch(data),
            (map.list || [])?.filter((x) => x.value === data).length < 1 &&
              AddHistory(option, GROUP_MAP.HISTORY),
            GetLangLat(option.key),
            setZoom(16)
          )}
          placeholder="Input location here"
        />
      }
      className="drawer-location-search"
      placement="left"
      closable={false}
      onClose={onClose}
      open={visible}
      key="left"
    >
      <List
        dataSource={map.groupedList[GROUP_MAP.HISTORY]?.list || []}
        grid={{
          column: 1,
          gutter: 8,
        }}
        renderItem={(t) => (
          <Row
            className="list-item use-pointer"
            onClick={() => (setSearch(t.value), GetLangLat(t.key), onClose())}
            gutter={8}
            wrap={false}
          >
            <Col>
              <ClockCircleOutlined />
            </Col>
            <Col>{t.value}</Col>
          </Row>
        )}
      />
    </Drawer>
  );
};

export default LocationSearchDrawer;
