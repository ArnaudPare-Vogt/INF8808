In order to pre-process the data you need the following:
 - An ULog file from a flight. You can find publicly available ones on the [flight review website.](https://review.px4.io/browse)
 - The [```ulog2csv```](https://github.com/PX4/pyulog) utility ( run ```pip install pyulog``` to install )
Then, you need to run the following command:
```
ulog2csv -o file_name file_name.ulg
```
This will create a directory named ```file_name```, that will contain all the content of the ```file_name.ulg``` file as csv files.