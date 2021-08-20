import colorsys
from PIL import Image
import urllib
import sys
import numpy as np
import base64
import cv2
import pyrebase
import eel
from shutil import copyfile

config = {
    "apiKey": "AIzaSyA7LVwbvq433xU3a4RauQja4bGz2mwmAoI",
    "authDomain": "web-inpaint-tool.firebaseapp.com",
    "databaseURL": "https://web-inpaint-tool-default-rtdb.firebaseio.com",
    "projectId": "web-inpaint-tool",
    "storageBucket": "web-inpaint-tool.appspot.com",
    "ServiceAccount": "web-inpaint-tool-firebase-admin.json"
}

firebaseStorage = pyrebase.initialize_app(config)
copyfile('D:/inpaint/Python test/code/final/blackMask.jpg', 'D:/inpaint/My tool2/images/currentMask.png')

eel.init('web')

@eel.expose
def editLayout(timestamp):
    Storage = firebaseStorage.storage()
    Storage.child(str(timestamp) + "/images/layouts/raw_layout.png").download("D:/inpaint/My tool2/images", "raw_layout.png")

    filename = "D:/inpaint/Python test/code/final/raw_layout.png"
    image = Image.open(filename).convert('RGB')
    img_array = image.load()

    width, height = image.size
    for x in range(0,width):
        for y in range(0,height):
            rgb = img_array[x,y]
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            if b != 255 or r != 255 or g != 255:
                img_array[x, y] = (0, 255, 0)

    image = image.convert('RGBA')

    newImage = []
    for item in image.getdata():
        if item[:3] == (255, 255, 255):
            newImage.append((0, 0, 0, 0))
        else:
            newImage.append(item)
    image.putdata(newImage)

    data = cv2.cvtColor(np.asarray(image),cv2.COLOR_RGB2BGR)
    kernel = np.ones((3,3), np.uint8)
    data = cv2.dilate(data, kernel, iterations = 1)

    image = Image.fromarray(cv2.cvtColor(data, cv2.COLOR_BGR2RGB))
    image = image.convert('RGBA')
    newImage = []
    for item in image.getdata():
        if item[:3] == (0, 0, 0):
            newImage.append((0, 0, 0, 0))
        else:
            newImage.append(item)
    image.putdata(newImage)

    image.save('D:/inpaint/My tool2/images/preprocessed_layout.png')
    Storage.child(str(timestamp) + "/images/layouts/preprocessed_layout.png").put("D:/inpaint/My tool2/images/preprocessed_layout.png")

@eel.expose
def editEdge(timestamp):
    Storage = firebaseStorage.storage()
    Storage.child(str(timestamp) + "/images/edges/raw_edge.png").download("D:/inpaint/My tool2/images", "raw_edge.png")

    filename = 'D:/inpaint/Python test/code/final/raw_edge.png'

    image = Image.open(filename).convert('RGB')
    img_array = image.load()

    width, height = image.size#获取宽度和高度
    for x in range(0,width):
        for y in range(0,height):
            rgb = img_array[x,y]#获取一个像素块的rgb
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            if b > 250 and r>250 and g>250:#判断规则
                img_array[x, y] = (0, 255, 0)


    image = image.convert('RGBA')

    newImage = []
    for item in image.getdata():
        if item[:3] == (0, 0, 0):
            newImage.append((255, 255, 255, 0))
        else:
            newImage.append(item)

    image.putdata(newImage)

    # 输出图片
    image.save('D:/inpaint/My tool2/images/preprocessed_edge.png')
    Storage.child(str(timestamp) + "/images/edges/preprocessed_edge.png").put("D:/inpaint/My tool2/images/preprocessed_edge.png")

@eel.expose
def generateMasks(timestamp):
    Storage = firebaseStorage.storage()
    Storage.child(str(timestamp) + "/images/segmentation.png").download("D:/inpaint/My tool2/images", "raw_seg.png")

    filename = 'D:/inpaint/Python test/code/final/raw_seg.png'

    image = Image.open(filename).convert('RGB')
    img_array = image.load()

    width, height = image.size
    for x in range(0,width):
        for y in range(0,height):
            rgb = img_array[x,y]
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            if r == 214 and g == 39 and b == 40:
                img_array[x, y] = (0, 0, 0)
            elif r == 78 and g == 71 and b == 183:
                img_array[x, y] = (0, 0, 0)
            elif r == 174 and g == 199 and b == 232:
                img_array[x, y] = (0, 0, 0)
            elif r == 152 and g == 223 and b == 138:
                img_array[x, y] = (0, 0, 0)
            elif r == 94 and g == 106 and b == 211:
                img_array[x, y] = (0, 0, 0)
            elif r == 197 and g == 176 and b == 213:
                img_array[x, y] = (0, 0, 0)
            else:
                img_array[x, y] = (255, 255, 255)


    image.save('D:/inpaint/My tool2/images/remove_all_mask.png')
    Storage.child(str(timestamp) + "/images/masks/remove_all_mask.png").put('D:/inpaint/My tool2/images/remove_all_mask.png')

    filename = 'D:/inpaint/Python test/code/final/raw_seg.png'

    image = Image.open(filename).convert('RGB')
    mapImage = image.copy()
    image = cv2.cvtColor(np.asarray(image),cv2.COLOR_RGB2BGR)
    img_array = mapImage.load()
    width, height = mapImage.size
    for x in range(0,width):
        for y in range(0,height):
            rgb = img_array[x,y]
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            if r == 214 and g == 39 and b == 40:
                img_array[x, y] = (0, 0, 0)
            elif r == 78 and g == 71 and b == 183:
                img_array[x, y] = (0, 0, 0)
            elif r == 174 and g == 199 and b == 232:
                img_array[x, y] = (0, 0, 0)
            elif r == 152 and g == 223 and b == 138:
                img_array[x, y] = (0, 0, 0)
            elif r == 94 and g == 106 and b == 211:
                img_array[x, y] = (0, 0, 0)
            elif r == 197 and g == 176 and b == 213:
                img_array[x, y] = (0, 0, 0)
            elif r == 0 and g == 0 and b == 0:
                img_array[x, y] = (0, 0, 0)
            else:
                img_array[x, y] = (r, g, b)

    mapImage = cv2.cvtColor(np.asarray(mapImage),cv2.COLOR_RGB2BGR)
    for x in range(0,height):
        for y in range(0,width):
            rgb = mapImage[x,y]
            r = rgb[0]
            g = rgb[1]
            b = rgb[2]
            if r != 0 or g != 0 or b != 0:
                x_axis = x
                y_axis = y
                copyImg = image.copy()
                h, w = image.shape[:2]

                color = copyImg[x_axis, y_axis]
                c1 = color[0]
                c2 = color[1]
                c3 = color[2]

                for i in range(0,h):
                    for j in range(0,w):
                        rgb = copyImg[i, j]
                        r = rgb[0]
                        g = rgb[1]
                        b = rgb[2]

                        if r == c1 and g == c2 and b == c3:
                            copyImg[i, j] = [255, 255, 255]
                            mapImage[i, j] = [0, 0, 0]
                        else :
                            copyImg[i, j] = [0, 0, 0]

                imageFile = Image.fromarray(cv2.cvtColor(copyImg,cv2.COLOR_BGR2RGB))
                #cv2.imwrite(filename, copyImg2)
                saveFilename = 'mask_' + str(c1) + '_' + str(c2) + '_' + str(c3) + '.png'
                imageFile.save('D:/inpaint/My tool2/images/' + saveFilename)
                Storage.child(str(timestamp) + "/images/masks/maskset/" + saveFilename).put('D:/inpaint/My tool2/images/' + saveFilename)

@eel.expose
def overlapMask(timestamp, SelectorAll, x, y): # true for select, false for remove all
    Storage = firebaseStorage.storage()
    Storage.child(str(timestamp) + "/images/masks/currentMask.png").download("D:/inpaint/My tool2/images", "currentMask.png")

    filename = 'D:/inpaint/My tool2/images/currentMask.png'
    image = Image.open(filename).convert('RGB')
    img_array = image.load()

    filename = 'D:/inpaint/Python test/code/final/raw_seg.png'
    segImage = Image.open(filename).convert('RGB')
    segimg_array = segImage.load()

    if (SelectorAll == True):
        color = segimg_array[x, y]
        c1 = color[0]
        c2 = color[1]
        c3 = color[2]
        filename = 'D:/inpaint/My tool2/images/mask_' + str(c3) + '_' + str(c2) + '_' + str(c1) + '.png'
        newMask = Image.open(filename).convert('RGB')

        width, height = image.size
        newimg_array = newMask.load()
        for i in range(0,width):
            for j in range(0,height):
                rgb = newimg_array[i, j]
                r = rgb[0]
                g = rgb[1]
                b = rgb[2]
                if r == 255 and g == 255 and b == 255:
                    img_array[i, j] = (255, 255, 255)
    else :
        filename = 'D:/inpaint/My tool2/images/remove_all_mask.png'
        newMask = Image.open(filename).convert('RGB')
        newimg_array = newMask.load()
        width, height = image.size
        for i in range(0,width):
            for j in range(0,height):
                rgb = newimg_array[i, j]
                r = rgb[0]
                g = rgb[1]
                b = rgb[2]
                if r == 255 and g == 255 and b == 255:
                    img_array[i, j] = (255, 255, 255)

    image.save('D:/inpaint/My tool2/images/currentMask.png')
    Storage.child(str(timestamp) + "/images/masks/currentMask.png").put('D:/inpaint/My tool2/images/currentMask.png')

eel.start('public/index.html')